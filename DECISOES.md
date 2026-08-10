# Decisões de arquitetura — Hub

Este documento registra as decisões tomadas para o início do projeto Hub, o motivo de cada uma e as alternativas descartadas. Serve como referência para não precisarmos re-discutir esses pontos a cada nova sessão de trabalho, e para quem entrar no projeto depois entender o "porquê", não só o "o quê".

## Contexto

O Hub vai substituir dois sistemas hoje separados (folha de pagamento e ERP financeiro/fiscal) por uma plataforma única. Esta primeira fase é genérica — ainda sem integrações externas específicas — cobrindo os módulos padrão de mercado: autenticação, contas a pagar, contas a receber, fluxo de caixa, cadastro de funcionários, folha de pagamento, dashboard, log de auditoria e controle de acesso por papel.

---

## 1. Linguagem: TypeScript no backend e no frontend

**Decisão:** TypeScript em toda a stack.

**Alternativas consideradas:** Python + Django/FastAPI no backend, com React/TS no frontend.

**Justificativa:** o domínio financeiro é sensível a divergência de contrato entre back e front (ex: formato de um valor monetário, nome de um campo). Com TypeScript nos dois lados, é possível compartilhar tipos e schemas de validação num pacote comum, eliminando essa classe de bug por construção. Também é a linguagem com maior disponibilidade de desenvolvedores no mercado brasileiro atual.

---

## 2. Backend: NestJS

**Decisão:** Node.js + NestJS.

**Alternativas consideradas:**
- Express/Fastify puro — liberdade total, mas sem estrutura: cada módulo (contas a pagar, RH, folha) tenderia a organizar código de um jeito diferente, e regras como controle de acesso por papel precisariam ser reimplementadas manualmente em cada rota.
- Deixar o frontend falar direto com a API automática do Supabase (PostgREST) + Row Level Security, sem backend próprio — viável para CRUD simples, mas frágil para lógica de negócio como cálculo de folha de pagamento e para centralizar log de auditoria de forma consistente.

**Justificativa:** o NestJS já resolve, de fábrica, exatamente os requisitos que pesam mais aqui — guards de permissão por papel (`@Roles('admin')`), validação de payload, filtros de exceção padronizados (bons para um log de auditoria consistente) e injeção de dependência (facilita testar regras de cálculo de folha isoladamente). O Nest continua sendo o dono das regras de negócio; o Supabase cuida de banco e autenticação (ver itens 3 e 4).

---

## 3. Banco de dados: Postgres do Supabase + Prisma

**Decisão:** usar o Postgres hospedado pelo Supabase (projeto já existente do usuário) como banco de dados, acessado via Prisma.

**Alternativas consideradas:** Postgres instalado nativamente no Windows; SQLite para começar.

**Justificativa:** Supabase já é a ferramenta de banco usada no dia a dia da Nexi — adaptar a stack a essa prática evita introduzir uma segunda forma de gerenciar banco em paralelo, e elimina a necessidade de instalar e manter Postgres localmente no Windows. Prisma continua funcionando normalmente sobre o Postgres do Supabase (é só uma connection string), preservando migrations versionadas e type-safety ponta a ponta.

**Consequência:** o Redis, que havia sido considerado para sessão de login, saiu do escopo inicial — decisão do item 4 (Supabase Auth) o torna inecessário por ora.

---

## 4. Autenticação: Supabase Auth

**Decisão:** usar o Supabase Auth para cadastro, login, sessão e recuperação de senha, em vez de construir esse fluxo do zero no Nest.

**Alternativas consideradas:** autenticação própria no NestJS, com sessão guardada em tabela no Postgres.

**Justificativa:** Supabase Auth entrega pronto e testado em produção exatamente o que o MVP exige ("login obrigatório desde o MVP"): cadastro, login, emissão/renovação de sessão e recuperação de senha. Isso poupa tempo de desenvolvimento numa parte que não é diferencial do produto. O NestJS mantém o controle real: valida o token (JWT) emitido pelo Supabase em cada requisição e aplica as regras de RBAC e log de auditoria por cima.

**Adendo (pedido do supervisor):** os e-mails desses fluxos (confirmação de cadastro, redefinição de senha, magic link, etc.) não devem usar o remetente/template padrão do Supabase — devem ser enviados a partir de `accounting@nexiplay.com`, com aparência personalizada. Marcado como "se der tempo", ou seja, não bloqueia o MVP, mas entra no backlog.

Tecnicamente isso é possível porque o Supabase Auth permite trocar o serviço de e-mail padrão por um **SMTP customizado** nas configurações de Auth do projeto — a partir daí, todo e-mail (confirmação, recuperação de senha, convite, troca de e-mail) passa a ser enviado com o remetente configurado (`accounting@nexiplay.com`) em vez do domínio do Supabase. Os templates de cada e-mail (HTML/assunto) também são editáveis nessa mesma tela, então dá pra alinhar visualmente com o Design System do item 6. `accounting@nexiplay.com` está no **Google Workspace**, então o SMTP a configurar no Supabase Auth é o do Workspace (`smtp.gmail.com`, porta 587). Para isso funcionar é preciso gerar uma **senha de app** (ou configurar um relay SMTP do Workspace, se a política do domínio exigir 2FA) na própria conta `accounting@nexiplay.com` — algo que só quem tem acesso a essa caixa/admin do Workspace consegue fazer, então esse passo fica pendente de alguém com esse acesso (o supervisor ou o admin do Workspace da Nexi) antes de eu poder configurar o SMTP no Supabase.

---

## 5. Frontend: React + Vite

**Decisão:** React + Vite + TypeScript.

**Alternativas consideradas:** Create React App (CRA); Next.js.

**Justificativa:** CRA foi descontinuado pelo próprio time do React em 2023 e não recebe mais atualizações — não é mais uma opção viável para um projeto novo. Vite é o substituto de fato, recomendado atualmente na documentação oficial do React: mesma proposta (bundler + dev server), só que mais rápido e mantido. Next.js foi descartado porque traz roteamento por arquivo, SSR e API routes que não usaríamos, já que o backend de regras de negócio já existe separado no Nest — seria complexidade sem benefício aqui.

---

## 6. Estilo / Design System: Tailwind CSS

**Decisão:** Tailwind CSS, configurado com os tokens já definidos em `design-system.html` (paleta de cores, fonte Montserrat, componentes de botão/badge/input/card).

**Isso é uma revisão de uma decisão anterior.** Antes de encontrar o arquivo `design-system.html` no projeto, a recomendação era CSS Modules + variáveis CSS, justamente para não prender a UI a um framework de estilos difícil de trocar quando o Design System oficial da Nexi chegasse. Ao abrir o arquivo, ficou claro que **o Design System da Nexify já existe e já fala Tailwind**: ele define um `tailwind.config` com cores customizadas (`bg-main`, `bg-card`, `brand` `#09bc8a`, `blue`, `yellow`, `red`, `neutral`, `bronze`, etc.) e todos os componentes de referência (botões, badges, inputs, cards) são escritos em classes utilitárias do Tailwind.

**Justificativa da mudança:** usar CSS Modules aqui significaria traduzir manualmente cada classe Tailwind já prototipada nesse arquivo para outra sintaxe — trabalho extra e risco de diferenças sutis em relação à referência visual oficial. Adotando Tailwind, o `tailwind.config.ts` do projeto passa a ser a camada de tokens (a mesma função que as variáveis CSS teriam): se a paleta ou a tipografia mudarem no futuro, o ajuste é num arquivo de configuração central, não espalhado pelos componentes — a flexibilidade que eu queria preservar continua existindo, só que expressa na ferramenta que o próprio Design System já usa.

**Consequência prática:** o `design-system.html` vira a fonte de verdade inicial dos tokens visuais (cores, tipografia, componentes base) até que a Nexi entregue uma versão mais formal/expandida do Design System.

---

## 7. Estrutura de repositório: Monorepo (pnpm workspaces + Turborepo)

**Decisão:** um único repositório com `apps/api` (Nest), `apps/web` (React) e `packages/shared` (tipos e schemas compartilhados).

**Alternativas consideradas:** repositórios separados para backend e frontend.

**Justificativa:** o ganho principal do monorepo aqui é técnico, não organizacional — tipos e schemas de validação (ex: o formato de uma `ContaPagar`) ficam definidos uma única vez em `packages/shared` e são importados pelos dois lados, então back e front nunca discordam sobre o formato de um dado. Também permite que uma mudança que toca os dois (ex: novo campo em contas a pagar) seja um único commit/PR, em vez de duas mudanças coordenadas manualmente em repositórios diferentes. Isso só vira desvantagem em times grandes com ritmos de deploy bem diferentes por app — não é o cenário atual (time pequeno, produto único).

O pnpm workspaces é o que declara quais pastas são "pacotes" dentro do repositório; o Turborepo orquestra rodar build/dev/test respeitando a ordem de dependência entre eles (ex: constrói `packages/shared` antes de quem o importa) e cacheia o que não mudou, pra não reprocessar tudo a cada execução.

---

## 8. Modelo de dados: single-tenant

**Decisão:** o Hub atende só a Nexi (uso interno). Não existe conceito de "empresa" como escopo de dado — nenhuma tabela precisa de uma coluna `empresa_id`.

**Alternativa considerada:** multi-tenant (uma instalação atendendo várias empresas-clientes, com isolamento de dados por empresa, tipicamente via `empresa_id` + Row Level Security).

**Justificativa:** decisão de negócio confirmada pelo usuário — o Hub não vai ser vendido a outras empresas nesta fase. Manter o modelo single-tenant evita complexidade de autorização e de esquema que não teria uso agora.

**Consequência:** se o Hub vier a ser oferecido a outras empresas no futuro, essa mudança para multi-tenant exige uma migração real de dados (adicionar `empresa_id` em todas as tabelas de negócio e revisar toda query/policy) — não é um ajuste trivial, é uma decisão que fica "travada" por ora.

---

## 9. Nomenclatura: português no código e na UI

**Decisão:** entidades, módulos e código em português (ex: `ContaPagar`, `contas-pagar`, `folha-pagamento`), além dos textos de interface.

**Alternativa considerada:** código em inglês (convenção mais comum de mercado) com UI em português.

**Justificativa:** decisão do usuário, priorizando proximidade com o vocabulário do domínio de negócio (financeiro/fiscal brasileiro) sobre a convenção internacional de código em inglês.

---

## 10. Controle de versão: Git ainda não inicializado

**Decisão:** por enquanto, nenhuma ação de Git (`git init`, commits) — só os arquivos do projeto em disco.

**Justificativa:** decisão explícita do usuário. O repositório remoto também será criado depois, com uma conta do GitHub diferente da configurada neste ambiente.

---

## 11. Conexão com o Postgres: via connection pooler, não conexão direta

**Decisão:** a `DATABASE_URL` usa o host do **Session pooler** do Supabase (`aws-0-<região>.pooler.supabase.com:5432`, usuário no formato `postgres.<ref-do-projeto>`), não o host de conexão direta (`db.<ref-do-projeto>.supabase.co:5432`).

**Justificativa:** o host de conexão direta é IPv6-only nos projetos novos do Supabase, e a rede usada para desenvolver não tem IPv6 — a conexão falhava com erro `P1001` antes de sequer chegar a autenticar. O pooler tem um host com IPv4, então funciona nesse ambiente. Efeito prático nenhum na aplicação: para o Prisma é só outra connection string.

---

## 12. Validação de token no backend: chamada à API do Supabase, não segredo compartilhado

**Decisão:** o `SupabaseAuthGuard` valida o Bearer token chamando `supabase.auth.getUser(token)` (biblioteca `@supabase/supabase-js`), em vez de verificar a assinatura localmente com `jsonwebtoken` + `SUPABASE_JWT_SECRET`.

**Alternativa descartada:** validação local via HS256 com o "Legacy JWT Secret" — era o plano original (ver item 4), mas as chaves deste projeto já são do formato novo do Supabase (`sb_publishable_...`), que tende a usar assinatura assimétrica. Depender do segredo HS256 legado teria risco de parar de funcionar se o Supabase completar a migração desse projeto para o esquema novo.

**Consequência:** a variável `SUPABASE_JWT_SECRET` foi removida do projeto (não existe mais nos `.env.example`). O custo é uma chamada de rede extra por requisição (a API do Supabase, não o banco) — aceitável para o volume de uso interno do Hub.

---

## 13. Fluxo de caixa: tabela própria (`MovimentacaoCaixa`)

**Decisão:** cada lançamento do fluxo de caixa (entrada/saída) é registrado numa tabela própria, independente de `contas_pagar`/`contas_receber`.

**Justificativa:** nem toda movimentação de caixa corresponde a uma conta específica (ex: adiantamento de folha) — modelar como tabela própria evita forçar todo lançamento a se encaixar numa conta a pagar/receber existente. Esse model não existia no schema original do scaffold; foi adicionado ao conectar o módulo ao Prisma.

---

## 14. Papel exigido por rota: mapeamento provisório

**Decisão (provisória, não confirmada com o usuário):** ao aplicar os guards de autorização em todas as rotas, cada módulo recebeu um conjunto de papéis permitidos — contas a pagar/receber e fluxo de caixa: `admin`+`financeiro`; folha de pagamento: `admin`+`rh`; auditoria: só `admin`; dashboard: qualquer usuário autenticado, sem restrição de papel.

**Por que está marcado como provisório:** essa regra não estava especificada em nenhum lugar — foi um critério razoável adotado para não deixar as rotas abertas, mas não é uma decisão de negócio confirmada. Deve ser revisada com quem define as regras de acesso da Nexi.

---

## Pontos abertos para quando o scaffold começar

- Confirmar se o `design-system.html` reflete o estado atual/final da paleta ou se é um rascunho — para saber se já podemos tratá-lo como fonte de verdade ou só como ponto de partida.
- Definir onde ficam as chaves do Supabase (`.env` local, fora do controle de versão) no momento em que o scaffold for gerado.
