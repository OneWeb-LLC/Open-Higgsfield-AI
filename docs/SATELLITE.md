# Open Higgsfield AI — OWeb satellite

`app_id`: **open-higgsfield-ai**  
Activation scope: **workspace**  
Auth host: **https://auth.oweb.one**  
Control plane: **https://oweb.one**

This deployment is an OWeb constellation satellite. Identity, workspaces, and billing stay on One OS — this app does not operate a second auth or Supabase project.

## Auth flows

| Path | Entry | Notes |
|------|--------|--------|
| Native | `/login` | Email/password against shared Supabase Auth (`ao-supabase-auth` session key) |
| OWeb return | `https://oweb.one/login?launch=open-higgsfield-ai` | App Store mints token → `/sso?launch_token=…` |
| SSO redeem | `/sso` | Server redeem via `SUPABASE_SERVICE_ROLE_KEY`, then `setSession` |

Post-auth (native or SSO): server resolves workspace context, calls OWeb activation APIs (with RPC fallback), upserts `ohf_profiles`.

## Environment

See `.env.example` and `ENV_AUDIT.md`. Never commit service role keys.

## Schema

Apply `supabase/migrations/20261007220000_ohf_profiles_isolation.sql` on the shared One OS project.

## Control-plane registration (separate PR)

Register `open-higgsfield-ai` in OWeb `ecosystem-apps.ts` with `activationScope: "workspace"` and production `launchUrl` before marking the app live in the App Store.

Canonical contracts: OneWeb-LLC/oweb `docs/SATELLITE_ONBOARDING_KIT.md`, `docs/SATELLITE_AUTH_RETURN.md`.
