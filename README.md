# NYKE

NYKE is a Next.js App Router application for public FPS player profiles, aim settings, active gear, identity badges, and shareable NYKE Cards.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable/anon key.
3. Run `npm install` and `npm run dev`.

Required variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never add a service-role key, database password, or another server secret to a `NEXT_PUBLIC_*` variable. `.env.local` is ignored by Git.

## Validation

```bash
npm run gear:check
npm run lint
npm run build
```

## Database

Supabase migrations are stored in `supabase/migrations`. Apply them in numeric order to the target project. RLS protects owner writes while public player identity, settings, active gear, catalog, and badges remain readable.

## Deployment readiness

The `nyke-platform` branch is intended for Vercel Preview validation before any production merge. Production environment variables, Auth redirect URLs, email delivery, domain/DNS, and final browser E2E must be checked manually. See `docs/BETA-PREFLIGHT.md` for the current launch gate and exact checklist.
