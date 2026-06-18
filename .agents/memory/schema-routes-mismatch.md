---
name: Schema vs routes mismatch
description: Tables referenced in admin routes that were missing from the Drizzle schema
---

`artifacts/api-server/src/routes/admin.ts` references tables not originally in `lib/db/src/schema/index.ts`:
- `user_settings` — original schema had `settingsTable` using table name `"settings"`
- `tenant_subscriptions` — not in original schema at all
- `subscription_payments` — not in original schema at all
- `ai_memories` — was in schema but not pushed

All four are now defined in the schema and pushed to the DB.

**Why:** The admin routes were written expecting a richer schema than what was in the Drizzle definition file. This caused every route to fail with "relation does not exist" which manifested as 15-second hangs.

**How to apply:** When adding new admin routes that reference tables, always add those tables to `lib/db/src/schema/index.ts` and run `pnpm --filter @workspace/db run push`.
