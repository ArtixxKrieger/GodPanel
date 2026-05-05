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
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken) — single admin password, no public signup

## Artifacts

### ArtixPOS Admin Dashboard (`artifacts/artix-admin`) — PRIMARY
- React + Vite frontend at `/` (root path), port 22273
- Advanced dark admin UI — dark green/teal/purple theme
- API: connects to local API server at `/api` (proxied path)
- Auth: auto-authenticates silently on startup using `VITE_ADMIN_PASSWORD` env var injected by Vite
- JWT stored in `localStorage` as `artix_admin_token`; auto-retries on 401
- Pages: Dashboard, Users, Stores, Revenue, Analytics, AI Usage, Activity, Security, Geo Map, Settings
- Features: ban/unban users, world map by region, live activity feed, recharts, react-simple-maps
- No login screen — fully seamless auto-auth

### ArtixPOS Admin Panel (`artifacts/admin-panel`) — Legacy (not started)
- Older admin panel, replaced by artix-admin

### API Server (`artifacts/api-server`)
- Express 5 backend at `/api`, port 8080
- Admin routes in `src/routes/admin.ts` — all protected by JWT `requireAuth` middleware
- Login: `POST /api/admin/login` with `{ password }` → returns JWT token
- Endpoints: `/admin/dashboard`, `/admin/users`, `/admin/revenue`, `/admin/revenue/top-stores`, `/admin/stores`, `/admin/stores/:userId`, `/admin/ai-usage`
- Health check: `GET /api/healthz`
- Connects to POS database tables: `users`, `sales`, `products`, `expenses`, `ai_memories`, `user_settings`, `tenant_subscriptions`, `subscription_payments`

## Dashboard API Response Shape

`GET /api/admin/dashboard` returns:
- `totalUsers`: number
- `newSignupsThisWeek`: number
- `newSignupsPrevWeek`: number
- `bannedUsers`: number
- `platformRevenue`: number (subscription payments)
- `revenueThisMonth`: number
- `revenueLastMonth`: number
- `activeSubscriptions`: number
- `freeUsers`: number
- `pendingPayments`: number
- `totalPosRevenue`: number (POS sales total)
- `totalPosSales`: number
- `activeStores`: number
- `recentSignups`: array
- `subscriptionBreakdown`: array

## Database Tables (POS System)

- `users` — business owners and staff
- `user_settings` — per-user store config (store_name, currency, business_type)
- `products` — store products
- `sales` — transaction records
- `expenses` — store expenses
- `ai_memories` — AI memory facts per tenant
- `tenant_subscriptions` — plan/status per tenant
- `subscription_payments` — payment history

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (secret)
- `ADMIN_PASSWORD` — admin password for login (shared env var, set to `ArtixAdmin2024!`)
- `JWT_SECRET` — secret for signing JWT tokens (shared env var)
- `SESSION_SECRET` — general session secret

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Notes

- Vite injects `VITE_ADMIN_PASSWORD` via `define` in `vite.config.ts` so the dashboard can auto-login
- The `lib/api-zod/src/index.ts` only exports from `./generated/api` to avoid name conflicts

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
