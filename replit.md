# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (raw SQL via `db.execute(sql\`...\`)` for complex admin queries)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken) — single admin password, no public signup

## Artifacts

### ArtixPOS Admin Panel (`artifacts/admin-panel`)
- React + Vite frontend at `/` (root path)
- Dark professional admin UI with Tailwind CSS
- Pages: Login, Dashboard, Users, Revenue Analytics, Store Explorer, AI Usage
- Auth: JWT stored in localStorage as `artixpos_admin_token`
- All API calls need `Authorization: Bearer <token>` header

### API Server (`artifacts/api-server`)
- Express 5 backend at `/api`
- Admin routes in `src/routes/admin.ts`
- JWT auth middleware (`requireAuth`)
- Connects to POS database tables: `users`, `sales`, `products`, `expenses`, `ai_memories`, `settings`

## Database Tables (POS System)

- `users` — business owners and staff
- `settings` — per-user store configuration (store_name, currency, business_type)
- `products` — store products
- `sales` — transaction records
- `expenses` — store expenses
- `ai_memories` — AI memory facts per tenant

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_PASSWORD` — single hardcoded admin password for login
- `JWT_SECRET` — secret for signing JWT tokens
- `SESSION_SECRET` — general session secret

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Notes

- The `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid name conflicts
- The orval config has `indexFiles: false` for the zod output to prevent barrel regeneration

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
