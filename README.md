# Hub

Plataforma financeira interna da Nexi — substitui os sistemas separados de folha de pagamento e ERP financeiro/fiscal.

As decisões de arquitetura (stack, monorepo, autenticação, etc.) e o motivo de cada uma estão em [`DECISOES.md`](./DECISOES.md). O que cada tela faz, campo a campo, está em [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md).

## Stack

- **Backend** (`apps/api`): NestJS + TypeScript
- **Frontend** (`apps/web`): React + Vite + TypeScript + Tailwind CSS (tokens do Design System da Nexify)
- **Banco de dados**: Postgres do Supabase + Prisma (`apps/api/prisma/schema.prisma`)
- **Autenticação**: Supabase Auth (ainda não conectada — ver "O que falta" abaixo)
- **Monorepo**: pnpm workspaces + Turborepo

## Status

Backend e frontend usam dados reais (Postgres do Supabase) do início ao fim — não há mais mock em nenhuma tela. Detalhe completo de cada funcionalidade em [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md).

**O que já funciona:**
- Monorepo com `apps/api`, `apps/web` e `packages/shared`
- API NestJS com um módulo por domínio (contas a pagar, contas a receber, fluxo de caixa, funcionários, folha de pagamento, dashboard, auditoria), cada um consultando o Postgres do Supabase via Prisma
- Frontend React consumindo a API de verdade (`fetch`), com navegação entre todas as páginas, filtros por status e formatação de moeda/data em pt-BR
- Login real via Supabase Auth (`apps/web/src/autenticacao/AuthContext.tsx`) — sessão, token e logout de verdade, não é mais stub
- Todas as rotas da API exigem um Bearer token válido (`SupabaseAuthGuard`, que valida contra a API do Supabase) e papel compatível (`RolesGuard` + `@Roles(...)`)
- Migrations do Prisma aplicadas contra o Postgres do Supabase
- Criação e edição de funcionários, contas a pagar e contas a receber pela própria interface (antes só existiam os botões, sem funcionalidade)
- Parcelamento de contas a pagar/receber e limite de valor (R$ 5.000.000) contra digitação errada
- Cadastro de movimentações de caixa pela interface, e gráficos (Fluxo de Caixa e sparkline do Dashboard) calculados a partir de dados reais, não mais estáticos
- Folha de Pagamento calculada em tempo real a partir dos funcionários ativos, com ação de "processar" para registrar o histórico
- Repositório Git inicializado e conectado a um remoto

**O que falta (próximos passos):**
- Revisar se o mapeamento de papel por rota (quem pode ver o quê) está do jeito que a Nexi quer — foi uma decisão provisória, não uma regra de negócio confirmada
- Configurar o envio de e-mail personalizado do Supabase Auth (`accounting@nexiplay.com`, ver `DECISOES.md`) — combinado que fica pra depois
- Ver a seção "Resumo do que ainda não existe" em [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md) para a lista completa de lacunas conhecidas (ex: log de auditoria não é gerado automaticamente, sem cálculo de descontos na folha, etc.)

## Estrutura

```
hub/
├── apps/
│   ├── api/          # NestJS
│   └── web/          # React + Vite
├── packages/
│   └── shared/       # tipos compartilhados (ainda não importado pelos apps — ver DECISOES.md)
├── DECISOES.md
├── FUNCIONALIDADES.md
└── design-system.html
```

## Como rodar localmente

### Pré-requisitos

- Node.js 20 ou 22
- Uma conta e um projeto no [Supabase](https://supabase.com) (para o banco de dados; o login real ainda não está conectado)

Este projeto usa **pnpm**. Se o `pnpm` não estiver disponível globalmente na sua máquina, rode todos os comandos abaixo prefixados com `npx pnpm@9` (ex: `npx pnpm@9 install`) — foi assim que este scaffold foi criado e testado.

### 1. Instalar dependências

Na raiz do projeto:

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Preencha `apps/api/.env` com a connection string do Postgres do seu projeto Supabase — use o **connection pooler** (Session pooler), não a conexão direta, que costuma ser IPv6-only e falhar em rede sem IPv6 — e as chaves de API (**Settings → API**).

### 3. Gerar o cliente do Prisma e rodar as migrations

```bash
pnpm --filter @hub/api exec prisma generate
pnpm --filter @hub/api exec prisma migrate dev
```

Não há mais script de seed — os dados de exemplo originais foram removidos de propósito (ver histórico do Git). O banco sobe vazio; os cadastros são feitos pela própria interface depois do login (ver [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md)).

### 4. Rodar em desenvolvimento

Na raiz, sobe a API (porta **3001**) e o frontend (porta **5173**) juntos:

```bash
pnpm dev
```

Ou separadamente:

```bash
pnpm --filter @hub/api dev
pnpm --filter @hub/web dev
```

Acesse `http://localhost:5173`. Login exige um usuário real cadastrado no Supabase Auth (**Authentication → Users**, com `app_metadata.papel` definido) — ver a seção "Login" em [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md) para o passo a passo.
