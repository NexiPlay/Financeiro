# Hub

Plataforma financeira interna da Nexi — substitui os sistemas separados de folha de pagamento e ERP financeiro/fiscal.

As decisões de arquitetura (stack, monorepo, autenticação, etc.) e o motivo de cada uma estão em [`DECISOES.md`](./DECISOES.md).

## Stack

- **Backend** (`apps/api`): NestJS + TypeScript
- **Frontend** (`apps/web`): React + Vite + TypeScript + Tailwind CSS (tokens do Design System da Nexify)
- **Banco de dados**: Postgres do Supabase + Prisma (`apps/api/prisma/schema.prisma`)
- **Autenticação**: Supabase Auth (ainda não conectada — ver "O que falta" abaixo)
- **Monorepo**: pnpm workspaces + Turborepo

## Status

Backend e frontend já usam dados reais — não é mais mock.

**O que já funciona:**
- Monorepo com `apps/api`, `apps/web` e `packages/shared`
- API NestJS com um módulo por domínio (contas a pagar, contas a receber, fluxo de caixa, funcionários, folha de pagamento, dashboard, auditoria), cada um consultando o Postgres do Supabase via Prisma
- Frontend React consumindo a API de verdade (`fetch`), com navegação entre todas as páginas, filtros por status e formatação de moeda/data em pt-BR
- Login real via Supabase Auth (`apps/web/src/autenticacao/AuthContext.tsx`) — sessão, token e logout de verdade, não é mais stub
- Todas as rotas da API exigem um Bearer token válido (`SupabaseAuthGuard`, que valida contra a API do Supabase) e papel compatível (`RolesGuard` + `@Roles(...)`)
- Migrations do Prisma aplicadas contra o Postgres do Supabase

**O que falta (próximos passos):**
- Criar ao menos um usuário real no Supabase Auth (**Authentication → Users**) pra poder logar — hoje nenhum existe ainda. Definir `app_metadata.papel` (`admin`/`financeiro`/`rh`) em cada usuário controla o que ele pode acessar; sem isso, o papel padrão é `financeiro`
- Revisar se o mapeamento de papel por rota (quem pode ver o quê) está do jeito que a Nexi quer — foi uma decisão provisória, não uma regra de negócio confirmada
- Configurar o envio de e-mail personalizado do Supabase Auth (`accounting@nexiplay.com`, ver `DECISOES.md`) — combinado que fica pra depois
- `git init` — combinado que fica pra depois

## Estrutura

```
hub/
├── apps/
│   ├── api/          # NestJS
│   └── web/          # React + Vite
├── packages/
│   └── shared/       # tipos compartilhados (ainda não importado pelos apps — ver DECISOES.md)
├── DECISOES.md
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
pnpm --filter @hub/api exec prisma db seed
```

O `db seed` popula as tabelas com os mesmos dados de exemplo que antes eram mock, pra não subir com tudo vazio.

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

Acesse `http://localhost:5173`. Login exige um usuário real cadastrado no Supabase Auth (**Authentication → Users**) — ver "O que falta".
