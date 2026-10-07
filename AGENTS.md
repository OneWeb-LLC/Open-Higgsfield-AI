# AGENTS.md — Open Higgsfield AI

## Stack

- **Next.js 15** (App Router) + **React 19**
- Creative UI: `packages/studio` (Image / Video / Lip Sync / Cinema)
- **MuAPI** client calls are BYOK — keys in `localStorage` per user (`ohf_muapi_key_{userId}`)

## OWeb satellite

Follow OneWeb-LLC/oweb satellite contracts (`docs/SATELLITE_ONBOARDING_KIT.md`). Do not add a second auth or Supabase project.

| Concern | Location |
|---------|----------|
| App id / URLs | `lib/ohf/constants.js` |
| Browser Supabase | `lib/supabase/client.js` (`ao-supabase-auth`) |
| SSO redeem | `app/api/sso/redeem/route.js` |
| Post-login activation | `app/api/auth/complete/route.js`, `lib/workspace/session.server.js` |
| Protected studio | `middleware.js`, `app/studio/page.js` |

## Commands

```bash
npm install
npm run build:studio   # when studio package changes
npm run build
npm run test
npm run smoke:satellite
```

## Local dev without One OS secrets

Set `NEXT_PUBLIC_OHF_REQUIRE_AUTH=false` to open `/studio` without login (MuAPI BYOK still required). SSO redeem requires `SUPABASE_SERVICE_ROLE_KEY`.
