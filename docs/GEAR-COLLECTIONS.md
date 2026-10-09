# Gear Collections

## Scope

- `/settings/gear` manages all saved `player_gear` rows. Adding gear does not activate it.
- `/[username]/gear` exposes the active loadout and full public collection.
- Home shows up to six active items; NYKE Card continues to use active gear only.
- Edit Profile shows a gear summary and does not write to `player_gear`.

## Migration and Release Order

`009_player_gear_collection.sql` is **already applied** in the linked NYKE Supabase
project, verified on 2026-10-10 against the live migration history and schema.
The `player_gear_user_item_key` uniqueness constraint and
`public.set_active_player_gear(uuid)` RPC exist; no duplicate `(user_id, gear_item_id)`
pairs were found. This verification made no database changes. It does **not**
confirm that the current production web deployment uses the collection-safe UI.

The migration preserves existing rows, UUIDs, active states, and
`player_gear_one_active_category`. It adds `(user_id, gear_item_id)` uniqueness
and the `set_active_player_gear` transaction. The RPC uses the caller's identity,
table grants, and RLS. If existing duplicate rows are found, the migration stops
without deleting them. Activation failure rolls back the whole switch.

Before a separately approved application release:

1. **Do not reapply migration 009**; verify the target Supabase project and its
   migration history before any database operation.
2. Confirm that the production deployment includes the collection-safe
   Profile-save action together with the collection UI. Avoid rolling back to
   an older Profile-save action after inactive gear collections are in use.
3. Verify authenticated owner flows, cross-account isolation, and persisted state
   against the deployed Supabase project.
4. Complete the Preview/browser release checks in `docs/BETA-PREFLIGHT.md`.

**Do not use an older app deployment to save Profile after users start collecting
inactive gear.** The older Profile action deletes rows by category and can remove
saved items. Do not roll back to that action without protecting collection data.
Without 009, add/activate show a database-update error rather than performing a
non-atomic fallback. Existing collection reads still work.

## Local Verification

```sh
node --test scripts/test-gear-collections.mjs scripts/test-auth-redirects.mjs
npm install --prefix work/gear-test-runtime --no-save --no-package-lock --ignore-scripts @electric-sql/pglite@0.5.8
node scripts/test-gear-database.mjs
npm run lint
npm run build
git diff --check
```

PGlite is installed only in ignored `work/`; it is not an application dependency.
The database test creates an isolated in-memory PostgreSQL instance with fixture
identities and a minimal Auth schema. Mutation assertions run as nonsuperuser
roles with RLS enabled. It checks migration idempotency, existing-data preservation,
duplicates, active switching, rollback, owner removal, and cross-account denial.
Storage is out of scope. These checks do not substitute for live authenticated
acceptance testing after the migration is approved and deployed.
