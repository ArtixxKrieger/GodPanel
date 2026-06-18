---
name: DB connection priority
description: Which DATABASE_URL the API server should use and why ARTIX_DATABASE_URL fails
---

`lib/db/src/index.ts` has two possible connection strings. `ARTIX_DATABASE_URL` points to a Supabase pooler (`aws-1-ap-southeast-1.pooler.supabase.com`) that is unreachable from the Replit environment (connection hangs, never resolves). `DATABASE_URL` is the Replit-provisioned Postgres which works fine.

**Rule:** `lib/db/src/index.ts` must read `DATABASE_URL || ARTIX_DATABASE_URL` (Replit Postgres first). `drizzle.config.ts` uses `DATABASE_URL` for schema push, so the same DB must be used at runtime.

**Why:** ARTIX_DATABASE_URL causes every DB query to hang indefinitely (15s+ timeouts), making the entire dashboard appear broken even though the schema is correct.

**How to apply:** If dashboard queries timeout with no table errors in logs, check which DB the pool is connecting to. If `ARTIX_DATABASE_URL` is prioritized, swap to `DATABASE_URL`.
