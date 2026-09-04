# NYKE Beta Preflight

Audit date: 2026-09-05

Branch: `nyke-platform`

Supabase project: `NYKE` (`tpudvkoewsgofawctpbm`)

Target domain: `https://nyke.life`

## Launch verdict

**NOT READY for public Beta. READY FOR VERCEL PREVIEW FINAL QA.**

No code or database P0 blocker remains. Public Beta is still gated by the manual production configuration and true browser/account checks listed below. The branch has not been merged to `main` and has not been deployed to Production.

## Findings

| Priority | Status | Finding | Resolution |
| --- | --- | --- | --- |
| P1 | FIXED | Auth callback accepted an unvalidated `next` value. | Added shared internal-path validation and friendly invalid/expired callback handling. |
| P1 | FIXED | Route-owned usernames were not reserved. | Shared application validation plus database constraint in migration `008`. Existing `nyke` remains valid. |
| P1 | FIXED | Immediate-session registration stopped on the register page. | It now continues to `/settings/profile`; email-confirmation signup still shows `Check your email`. |
| P1 | FIXED | Logged-in users could revisit login/register and anonymous settings lost its destination. | Auth pages redirect signed-in users; settings redirects to `/login?next=/settings/profile`. |
| P1 | FIXED | API roles held table privileges beyond application needs. | Revoked defaults and re-granted only the required SELECT and owner-write operations. |
| P1 | FIXED | Public trigger functions were executable by API roles; one function had mutable `search_path`. | Revoked execution and pinned trigger function search paths. |
| P1 | FIXED | Owner RLS policies repeatedly evaluated `auth.uid()` per row. | Policies now use `(select auth.uid())`. |
| P1 | FIXED | Unknown usernames could reach production demo fallback behavior. | Production permits only explicit `/cyx`; unknown users now return 404. |
| P1 | FIXED | Production metadata, canonical URLs, robots, sitemap, OG image, global error UI, and route loading UI were incomplete. | Added the corresponding App Router files and one site URL helper. |
| P1 | FIXED | Profile and Card media could show broken-image icons. | Added initials/NYKE media fallback without changing upload or Storage behavior. |
| P1 | MANUAL CHECK REQUIRED | Supabase leaked-password protection is disabled. | Enable it in Supabase Auth password security before public Beta. |
| P1 | MANUAL CHECK REQUIRED | Production Auth URLs, SMTP/email delivery, Vercel env, new-account flow, and cross-account writes require a real Preview browser test. | Complete the manual gates below. |
| P2 | ACCEPTED BETA LIMITATION | No automated E2E/test suite exists. | Static, build, HTTP, database, and browser sanity checks cover this pass; add E2E after Beta. |
| P2 | ACCEPTED BETA LIMITATION | Security Advisor reports `private.identity_config` has RLS but no policy. | Intentional: this private trigger-only table is not accessible to API roles. |
| P2 | ACCEPTED BETA LIMITATION | Performance Advisor reports two unused indexes. | Keep the FK-supporting indexes until production traffic provides meaningful usage data. |
| P2 | ACCEPTED BETA LIMITATION | No web app manifest/apple icon set. | Existing `favicon.ico` loads; richer install metadata is not a Beta blocker. |
| P3 | MANUAL CHECK REQUIRED | Rapid automated route hopping can log `destination stream closed early` when the harness aborts an in-flight response. | Isolated route loads and browser console are clean; recheck normal Preview navigation before launch. |

## Auth and onboarding

- **PASS:** browser/server Supabase clients use `@supabase/ssr`; the Proxy matcher covers public, dynamic profile, settings, and Auth routes while excluding static image assets.
- **FIXED:** callback exchanges the PKCE code, rejects missing/invalid codes without crashing, and never redirects to an external origin.
- **FIXED:** callback without an explicit destination sends incomplete profiles to settings and configured profiles to their public username.
- **PASS:** username UX pre-check is backed by the database UNIQUE constraint; raw database/constraint details are not rendered.
- **PASS:** register and profile update share the same normalized username rules and reserved-name list.
- **PASS:** `auth.users.id` and `profiles.id` integrity is trigger-backed. Current audit: 1 Auth user, 1 Profile, 0 missing counterparts.
- **MANUAL CHECK REQUIRED:** register, email confirmation, password recovery, expired link, logout/login, and navbar refresh on the final Vercel Preview.

## Database and RLS

Migration `008_beta_preflight_security.sql` was applied successfully through Supabase MCP.

- `profiles`: anon/authenticated SELECT; authenticated UPDATE only on `username`, `display_name`, `avatar_url`, `banner_url`, `bio`, `region`; owner RLS remains enforced.
- `player_settings`: public SELECT; authenticated INSERT/UPDATE/DELETE with owner RLS.
- `player_gear`: public SELECT; authenticated INSERT/UPDATE/DELETE with owner RLS.
- `gear_items`, `badges`, `profile_badges`: public SELECT only; no client writes.
- `member_number`: 0 null/non-positive, 0 duplicates, no API update grant, no API sequence privilege.
- Official `@nyke` remains Member `#000001` with Founder, First 10, Early 100, and Beta.
- Beta identity switch remains enabled.
- Gear catalog remains 134 rows; 0 `player_gear` or badge orphans.
- **MANUAL TEST RECOMMENDED:** create two non-Founder accounts and prove A cannot modify B through the public client. Policy and grant inspection passes, but no second real account was created in this pass.

## Storage

- Public bucket `profile-media` remains enabled for public profile media.
- Bucket limit: 8 MB. Allowed MIME: JPEG, PNG, WebP.
- Authenticated writes are constrained to `{auth.uid()}/avatar/*` or `{auth.uid()}/banner/*`, with owner and extension checks on insert/update/delete.
- No anon write policy exists.
- **MANUAL CHECK REQUIRED:** upload, replace, remove, and cross-account denial using two real Preview sessions.

## Search and navigation

- **PASS:** global Search, Ctrl/Cmd+K, keyboard navigation, Escape, focus return, and mobile menu are implemented.
- **PASS:** Search is read-only, trims and caps input at 80 characters, uses Supabase query builders, limits results, and returns no email/private field.
- **PASS:** anonymous navigation has no fake `/cyx` Profile link.
- **PASS:** Footer contains no prototype/mock/auth disclaimer and its links resolve.

## SEO and route resilience

- Root title and description match the production brief.
- `NEXT_PUBLIC_SITE_URL` is the single site origin input; development falls back to localhost and production to `https://nyke.life`.
- Real profiles and Cards have dynamic title, description, canonical, Open Graph, and Twitter metadata without extra profile queries inside a request.
- `robots.txt` allows public pages and disallows Auth, settings, and API routes.
- `sitemap.xml` includes `/`, `/explore`, `/gear`, and real Profile/Gear/Card URLs from one batched profile read; demo `/cyx` is excluded.
- Default OG image is generated locally at 1200x630 with no external dependency.
- `favicon.ico`, global error recovery, Explore/Gear loading shells, public 404, and image fallbacks all respond.
- HTTP audit: public routes 200, anonymous settings 307 to safe login destination, unknown username 404.

## Validation completed

- `npm run gear:check`: PASS, 134 items and 37 local images.
- `npm run lint`: PASS.
- `npm run build`: PASS on Next.js 16.3.4.
- `git diff --check`: PASS.
- Product secret scan: PASS; `.env.local`, `.next`, and `node_modules` remain ignored.
- Supabase Security Advisor after migration: only leaked-password WARN and intentional private-table INFO remain.
- Supabase Performance Advisor after migration: only two unused-index INFO notices remain.
- Local production HTTP checks: `/`, `/explore`, `/gear`, `/nyke`, `/nyke/gear`, `/nyke/card`, `/cyx`, Auth pages, robots, sitemap, OG, and favicon respond; `/randomusername` returns 404.
- Browser console on the homepage: no warnings or errors in the local production build.
- Responsive browser audit at 390, 768, 1024, and 1440: no horizontal overflow and no broken rendered images across Home, Explore, Gear, Profile, Profile Gear, Card, Login, and Register.
- Global Search: Ctrl/Cmd+K opens the dialog; Escape closes it; keyboard focus return was corrected for shortcut-triggered opening.
- Real `@nyke` Card download produced a deterministic 1080x1220 PNG. Native Web Share and clipboard fallback remain a final-device manual check.

## Manual production checklist

### Vercel Preview and Production variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the project publishable/anon key, never a service-role key)
- `NEXT_PUBLIC_SITE_URL=https://nyke.life` for Production; use the actual Preview origin when validating Preview metadata if required.

### Supabase Auth

- Set Site URL to `https://nyke.life` before Production launch.
- Add `https://nyke.life/auth/callback` to allowed redirects.
- Add only the project-scoped Vercel Preview callback pattern needed for this project, following Supabase wildcard guidance; do not use an unrestricted wildcard.
- Confirm Email provider, confirmation policy, SMTP sender, delivery, expiry behavior, and branded email links.
- Enable leaked-password protection.

### Final Preview E2E

1. Register a fresh non-Founder account and confirm email if required.
2. Verify Profile trigger, next Member Number, First 10/Early 100/Beta eligibility, and settings onboarding.
3. Save identity, all Aim fields, and six Gear categories; refresh and open Profile, Gear, Card, Explore, Homepage, and Search.
4. Upload/replace/remove avatar and banner; verify anonymous reads and cross-account Storage denial.
5. Download Card PNG and verify expected dimensions, static export state, footer URL, and no pointer sheen residue.
6. Test Web Share where supported and URL/clipboard fallback elsewhere.
7. Test logout, login, forgot/reset password, invalid/expired callback, refresh, and a new tab.
8. Use a second test account to attempt cross-account Profile/Settings/Gear/Badge/Storage writes; all must fail.
9. Check 390, 768, 1024, and 1440 widths for overflow, clipping, dialogs, navbar, forms, and Card controls.
10. Review browser console/network for hydration failures, missing assets, image failures, rejected promises, and unexpected Supabase errors.

After these gates pass, the branch is ready to merge through the normal review process. This preflight does not authorize a `main` merge or Production deployment.
