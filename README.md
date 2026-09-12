# SLOTIX

Plataforma de agendamentos organizada como **monólito modular**: uma única API
central (Node.js + TypeScript + Prisma + PostgreSQL) consumida por uma app Web
(Next.js) e uma app Mobile (Expo + React Native).

```text
SLOTIX/
├── apps/
│   ├── api/       Node.js + TypeScript + Express + Prisma — o núcleo do sistema
│   ├── web/       Next.js — consumidor da API, sem acesso direto à BD
│   └── mobile/    Expo + React Native — consumidor da API, sem acesso direto à BD
└── packages/
    ├── types/       Tipos/DTOs partilhados entre API, Web e Mobile
    └── validation/  Schemas Zod partilhados (contratos de API)
```

## Arquitetura

- **Um único backend**: toda a lógica de negócio, autenticação e acesso a dados
  vive em `apps/api`, organizado em módulos por domínio
  (`auth`, `users`, `businesses`, `clients`, `professionals`, `services`,
  `appointments`, `payments`, `notifications`, `favorites`, `reviews`, `gallery`).
- **Frontend nunca acede à base de dados**: Web e Mobile falam apenas com a API
  REST versionada em `/api/v1`.
- **Autenticação centralizada**: JWT (access + refresh) emitido pela API,
  usado por Web e Mobile via header `Authorization: Bearer`.
- Cada módulo completo segue o padrão `*.controller.ts` → `*.service.ts` →
  `*.repository.ts`, com validação Zod em `*.schema.ts`.
- Módulos ainda não implementados (`payments`, `notifications`, `favorites`,
  `reviews`, `gallery`) existem como pastas reservadas com um router placeholder
  (`501 Not Implemented`) até serem construídos.

## Instalação

Requisitos: Node.js 20+, PostgreSQL, npm (workspaces).

```bash
npm install
cp apps/api/.env.example apps/api/.env      # preencher DATABASE_URL e segredos JWT
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

## Base de dados

```bash
cd apps/api
npx prisma migrate dev     # cria as tabelas
npm run seed                # cria negócio/owner/employee/service de exemplo
```

Contas criadas pelo seed (password `password123`):
`owner@slotix.dev`, `employee@slotix.dev`, `customer@slotix.dev`.

## Desenvolvimento

```bash
npm run dev:api      # Express em http://localhost:3000
npm run dev:web      # Next.js em http://localhost:3001
npm run dev:mobile   # Expo (usa o app Expo Go ou um simulador)
```

## Testes

```bash
npm run test:api
```

Cobre as regras críticas de `auth` (registo duplicado, credenciais inválidas)
e `appointments` (serviço/profissional inexistente ou inativo, horário
indisponível, permissões, transições de estado).

## API

Todas as respostas seguem o mesmo envelope:

```json
{ "success": true, "data": {} }
{ "success": false, "error": { "code": "APPOINTMENT_NOT_AVAILABLE", "message": "..." } }
```

Rotas principais (ver `apps/api/src/app/routes.ts`):
`/api/v1/auth`, `/api/v1/users`, `/api/v1/businesses`, `/api/v1/clients`,
`/api/v1/professionals`, `/api/v1/services`, `/api/v1/appointments`.

## Deployment

Ainda não configurado nesta fase (ver plano de migração para as fases seguintes).
