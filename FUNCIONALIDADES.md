# Funcionalidades do Hub

Este documento descreve, tela por tela, o que o Hub faz hoje: o que cada página mostra, quais ações existem, quais campos e validações cada formulário tem, e quem (qual papel) pode acessar o quê. Para o "porquê" das escolhas de arquitetura, ver [`DECISOES.md`](./DECISOES.md). Para instruções de instalação/setup, ver [`README.md`](./README.md).

Convenção usada abaixo: cada rota da API exige um Bearer token válido (login Supabase) — isso não é repetido em cada seção. O que varia por seção é o **papel exigido**.

---

## Papéis de usuário

Todo usuário tem um papel definido em `app_metadata.papel` no Supabase Auth: `admin`, `financeiro` ou `rh`. Se não for definido, o sistema assume `financeiro` por padrão (ver [`SupabaseAuthGuard`](./apps/api/src/autenticacao/supabase-auth.guard.ts)).

| Módulo | Papéis com acesso |
|---|---|
| Dashboard | qualquer usuário autenticado |
| Contas a Pagar | `admin`, `financeiro` |
| Contas a Receber | `admin`, `financeiro` |
| Fluxo de Caixa | `admin`, `financeiro` |
| Funcionários | `admin`, `rh` |
| Folha de Pagamento | `admin`, `rh` |
| Log de Auditoria | `admin` |

**Importante:** esse mapeamento é uma decisão provisória (ver item 14 de `DECISOES.md`), não uma regra de negócio confirmada pela Nexi. Se um usuário sem o papel certo tenta acessar um módulo, a API retorna `403 Forbidden` e a tela correspondente mostra uma mensagem de erro. O Dashboard é um caso especial porque ele mesmo busca `/contas-pagar` e `/fluxo-caixa/movimentacoes` internamente para dois widgets (resumo de contas a pagar e gráfico de saldo) — se o usuário logado não tiver papel `financeiro`/`admin`:
- O widget "Contas a Pagar" fica com o indicador de carregamento girando **para sempre** (o código não trata esse erro).
- O gráfico de saldo (sparkline) mostra silenciosamente "Sem histórico de movimentações ainda" — como se não houvesse dados, mesmo que existam, só que o usuário não tem permissão para vê-los.

---

## Login (`/login`)

Tela pública, sem autenticação. Formulário com e-mail e senha, autenticando via Supabase Auth (`signInWithPassword`). Em caso de erro, mostra "E-mail ou senha inválidos." (mensagem genérica — não diferencia usuário inexistente de senha errada, por segurança).

**O botão "Esqueci minha senha" existe visualmente mas não tem nenhuma ação associada.** É um placeholder — clicar nele não faz nada.

Não há como um usuário se auto-cadastrar pela tela: contas só são criadas manualmente no painel do Supabase (**Authentication → Users**), e o papel (`admin`/`financeiro`/`rh`) precisa ser definido à mão via SQL Editor, rodando:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"papel": "admin"}'::jsonb
where email = 'pessoa@nexiplay.com';
```

(O modal "Add user" do Supabase não tem campo para isso — só email/senha/confirmação.)

---

## Layout geral (`AppShell`)

Menu lateral fixo com três grupos: **Financeiro** (Contas a Pagar, Contas a Receber, Fluxo de Caixa), **Pessoas** (Funcionários, Folha de Pagamento) e **Sistema** (Log de Auditoria), além do Dashboard isolado no topo. O cabeçalho mostra o papel do usuário logado e um botão "Sair" (logout via Supabase). O menu não se adapta ao papel do usuário — todos os itens aparecem para todo mundo, mesmo que a API vá recusar o acesso (retornando 403) para quem não tem o papel certo.

---

## Dashboard (`/`)

Tela inicial, acessível a qualquer usuário autenticado. Mostra:

- **Saldo em caixa** — total acumulado de todas as movimentações de caixa (entradas − saídas), com um gráfico de tendência (sparkline) dos últimos 14 dias, calculado a partir do saldo acumulado dia a dia. Se não houver nenhuma movimentação de caixa cadastrada, mostra "Sem histórico de movimentações ainda" em vez do gráfico.
- **A pagar (7 dias)** — soma e quantidade de contas a pagar com status diferente de "pago".
- **A receber (7 dias)** — soma e quantidade de contas a receber com status diferente de "recebido".
- **Folha do mês** — valor líquido da competência de folha de pagamento mais recente processada (ou estimada, se ainda não processada) e quantidade de funcionários ativos.
- **Lista das 5 primeiras Contas a Pagar** (atalho para a tela completa).
- **Últimos 4 registros do Log de Auditoria.**

Nenhum desses widgets tem ação de criar/editar — o Dashboard é só leitura/resumo.

---

## Contas a Pagar (`/contas-pagar`)

Papel exigido: `admin` ou `financeiro`.

**Listagem:** tabela com fornecedor, descrição, vencimento, valor e status (`pendente`, `atrasado`, `pago`), com abas de filtro por status. Cards de resumo no topo (total pendente, atrasado, pago).

**Criar uma conta** (botão "+ Nova conta a pagar"): abre um modal com fornecedor, descrição, vencimento, valor e status.
- **Limite de valor:** o campo aceita no máximo **R$ 5.000.000,00**. Ao digitar um valor maior, o campo fica com borda vermelha, aparece um aviso, e o botão "Salvar" é desabilitado. Essa validação existe tanto no frontend (feedback imediato) quanto no backend (`ContasPagarController`, protege contra chamadas diretas à API).
- **Parcelamento:** campo "Parcelas" (padrão 1, máximo 60). Se for maior que 1, o sistema cria **uma linha por parcela**, com:
  - Vencimento de cada parcela um mês depois da anterior (mesmo dia do mês da primeira).
  - Valor total dividido igualmente entre as parcelas — se a divisão não for exata (ex: R$ 1.000,00 em 3x), o centavo residual vai para a **última** parcela, para a soma ficar exatamente igual ao valor total digitado.
  - Descrição com o sufixo `(1/3)`, `(2/3)` etc.
  - Todas as parcelas nascem com o mesmo status escolhido no formulário.
  - **Efeito de borda com datas no fim do mês:** o cálculo usa o `setMonth` do JavaScript, que não trava no último dia do mês de destino. Ex: 1ª parcela vencendo em 31/01 gera a 2ª parcela em 03/03 (não em 28/02 ou 29/02), porque fevereiro não tem dia 31 e o excesso "vaza" para o mês seguinte. Isso só acontece com vencimentos nos dias 29, 30 ou 31.

**Editar uma conta:** clicar em qualquer linha da tabela abre o mesmo modal, preenchido com os dados daquela conta. Ao salvar, atualiza só aquela linha (`PATCH`) — **editar uma parcela não recalcula nem afeta as outras parcelas do mesmo parcelamento**, nem existe hoje um jeito de ver/editar "o parcelamento inteiro" de uma vez; cada parcela é uma linha independente depois de criada. O campo "Parcelas" não aparece no modo de edição.

---

## Contas a Receber (`/contas-receber`)

Papel exigido: `admin` ou `financeiro`. Estrutura idêntica a Contas a Pagar (listagem com abas por status `pendente`/`atrasado`/`recebido`, criar, editar, limite de valor, parcelamento) — só troca "fornecedor" por "cliente".

---

## Fluxo de Caixa (`/fluxo-caixa`)

Papel exigido: `admin` ou `financeiro`.

**Gráfico "Entradas × Saídas — últimos 14 dias":** soma as movimentações de cada um dos últimos 14 dias corridos (hoje incluso) e desenha duas linhas (entradas em verde, saídas em vermelho) escaladas para o maior valor do período. Se não houver nenhuma movimentação nesses 14 dias, mostra "Sem movimentações registradas nos últimos 14 dias." em vez do gráfico vazio.

**Criar uma movimentação** (botão "+ Nova movimentação"): modal com descrição, data, valor e tipo (`entrada`/`saída`). Mesmo limite de R$ 5.000.000,00 do restante do sistema. **Não há edição nem exclusão de movimentações depois de criadas** — só criação e listagem.

**Tabela "Últimas Movimentações":** lista todas as movimentações cadastradas (não só as dos últimos 14 dias do gráfico), mais recentes primeiro.

---

## Funcionários (`/funcionarios`)

Papel exigido: `admin` ou `rh`.

**Listagem:** nome, cargo, departamento, admissão, salário base e status (`ativo`/`afastado`), com abas de filtro e cards de contagem (total, ativos, afastados).

**Criar** (botão "+ Novo funcionário") e **editar** (clicar na linha): mesmo modal, com nome, cargo, departamento, data de admissão, salário base e status. Não há limite de valor no salário (o teto de R$ 5.000.000,00 é só para contas a pagar/receber e movimentações de caixa) e não há parcelamento aqui — não faz sentido para salário.

---

## Folha de Pagamento (`/folha-pagamento`)

Papel exigido: `admin` ou `rh`.

Esta tela **não depende mais de dados digitados manualmente** — ela calcula a competência do mês atual em tempo real a partir da tabela de Funcionários:

- **Proventos** = soma do `salarioBase` de todos os funcionários com status `ativo`.
- **Descontos** = ainda não calculado (não existe motor de INSS/IRRF/etc. implementado) — aparece como "—" tanto na estimativa quanto depois de processada, para não inventar um número.
- **Líquido** = igual aos proventos, já que não há desconto modelado.

**Enquanto a competência do mês não foi processada**, os valores mostrados são uma **estimativa em tempo real** (recalculada a cada carregamento da tela, refletindo qualquer alteração recente no cadastro de funcionários) — a tela avisa isso explicitamente e mostra um botão **"Processar folha do mês"**.

**Ao clicar em "Processar folha do mês":** o backend grava um registro permanente (`CompetenciaFolha`) com os valores calculados naquele momento, e a competência passa a aparecer como "Processada" na tabela de histórico — a partir daí, os valores dessa competência ficam congelados (não recalculam mais, mesmo que o quadro de funcionários mude depois). Processar a mesma competência duas vezes não duplica o registro — a segunda chamada apenas retorna o registro já existente.

A tabela "Competências" na parte de baixo lista o histórico de competências já processadas, mais a estimativa da competência atual (se ainda não processada) no topo.

---

## Log de Auditoria (`/auditoria`)

Papel exigido: `admin`.

Tabela somente leitura: data/hora, usuário, ação e módulo. **Ponto importante:** hoje essa tabela (`log_auditoria`) não é preenchida automaticamente por nenhuma ação do sistema — criar uma conta, editar um funcionário, processar a folha, etc. não geram um registro aqui. A tela só lista o que existir na tabela; nenhum código do backend escreve nela fora do que foi inserido manualmente (ex: pelo seed original, hoje apagado). Ou seja, a auditoria automática das ações do sistema **ainda não foi implementada** — só a tela de leitura existe.

---

## Resumo do que ainda não existe

- Recuperação de senha (botão sem função no Login).
- Auto-cadastro de usuário pela aplicação (precisa ser feito no painel do Supabase).
- Geração automática de log de auditoria a partir das ações do sistema.
- Edição ou exclusão de movimentações de caixa depois de criadas.
- Cálculo de descontos (INSS/IRRF etc.) na Folha de Pagamento.
- Editar "o parcelamento inteiro" de uma vez — hoje cada parcela é uma linha independente após a criação.
- Adaptar o menu lateral ao papel do usuário (hoje todos os itens aparecem pra todo mundo, e quem não tem papel para um módulo só descobre ao entrar e ver o erro).
