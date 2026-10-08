# Environment Variable Audit — Open Higgsfield AI (OWeb satellite)

**Supabase project:** `ebjzdcnphkfpxfldnatm` (One OS)  
**Auth URL:** `https://auth.oweb.one`  
**App id:** `open-higgsfield-ai`

## Required (production)

| Variable | Client | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | One OS Supabase URL (`https://auth.oweb.one`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Anon/publishable key |
| `NEXT_PUBLIC_OWEB_APP_URL` | yes | `https://oweb.one` (Continue with OWeb) |
| `NEXT_PUBLIC_OWEB_PLATFORM_API_URL` | yes | `https://oweb.one/api/v1` — centralized SSO redeem |
| `NEXT_PUBLIC_APP_URL` | yes | This satellite origin (Vercel production URL) |

## Recommended

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_OHF_REQUIRE_AUTH` | `true` in production (middleware protects `/studio`) |
| `SUPABASE_URL` | Server alias for URL (optional if `NEXT_PUBLIC_*` set) |

## Generative API providers (studio UI)

| Variable | Client | Purpose |
|----------|--------|---------|
| `MUAPI_UPSTREAM` | no | Upstream for `/api/muapi` proxy (default `https://api.muapi.ai`) |
| `OHF_OWEB_BACKEND_API_UPSTREAM` | no | Optional OWeb `BACKEND_API_URL` mirror → **OWeb backend API** in UI |
| `NEXT_PUBLIC_OHF_DEFAULT_API_PROVIDER` | yes | Default selection (`muapi-proxy`, `muapi-direct`, …) |
| `NEXT_PUBLIC_OHF_OWEB_BACKEND_LABEL` | yes | Label for OWeb backend provider |
| `OHF_CUSTOM_API_UPSTREAM` | no | Optional third upstream |
| `NEXT_PUBLIC_OHF_CUSTOM_API_LABEL` | yes | Label for custom provider |

Sync Supabase/OWeb public env from the **oweb** Vercel project: `VERCEL_TOKEN=… npm run sync:vercel-env` (never copies service role).

## Explicitly not used

- **No `SUPABASE_SERVICE_ROLE_KEY`** — SSO launch tokens are redeemed via OWeb `POST /api/v1/ecosystem/redeem-launch-token` (satellite server calls OWeb; OWeb uses service role centrally).
- No second Supabase project
- No shared MuAPI platform key (BYOK per user in browser storage)
- No Clerk / app-local password store

Apply DB migration in `supabase/migrations/` on One OS before profile upsert in production.

**Note:** Centralized redeem requires OWeb PR #57 deployed to production before SSO return works end-to-end.
