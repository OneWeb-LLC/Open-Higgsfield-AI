#!/usr/bin/env node
/**
 * Copy whitelisted env vars from the oweb Vercel project into open-higgsfield-ai.
 * Uses @vercel/sdk (VERCEL_TOKEN required). Never copies SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   VERCEL_TOKEN=... npm run sync:vercel-env
 * Optional:
 *   OWEB_VERCEL_PROJECT=oweb
 *   OHF_VERCEL_PROJECT=open-higgsfield-ai
 *   VERCEL_TEAM_ID=team_...
 */

import { Vercel } from '@vercel/sdk';

const SOURCE_PROJECT = process.env.OWEB_VERCEL_PROJECT || 'oweb';
const TARGET_PROJECT = process.env.OHF_VERCEL_PROJECT || 'open-higgsfield-ai';
const TEAM_ID = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID;

/** Keys safe to mirror from oweb → OHF satellite (no service role). */
const COPY_KEYS = [
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_PROJECT_ID',
  'NEXT_PUBLIC_OWEB_APP_URL',
  'NEXT_PUBLIC_OWEB_PLATFORM_API_URL',
  'NEXT_PUBLIC_OWEB_ORIGIN',
  'NEXT_PUBLIC_OWEB_AUTH_HOST',
  'NEXT_PUBLIC_OWEB_APP_ID',
];

/** Map oweb secret → satellite server env for optional extra API provider. */
const RENAME_KEYS = {
  BACKEND_API_URL: 'OHF_OWEB_BACKEND_API_UPSTREAM',
};

const BLOCKED = new Set(['SUPABASE_SERVICE_ROLE_KEY']);

function teamFields() {
  return TEAM_ID ? { teamId: TEAM_ID } : {};
}

async function listProjectEnvs(vercel, projectIdOrName) {
  const res = await vercel.projects.filterProjectEnvs({
    idOrName: projectIdOrName,
    decrypt: 'true',
    ...teamFields(),
  });
  return res?.envs ?? [];
}

async function upsertEnv(vercel, projectIdOrName, entry) {
  await vercel.projects.createProjectEnv({
    idOrName: projectIdOrName,
    upsert: 'true',
    ...teamFields(),
    requestBody: entry,
  });
}

async function main() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.error('VERCEL_TOKEN is required');
    process.exit(1);
  }

  const vercel = new Vercel({ bearerToken: token });
  const sourceEnvs = await listProjectEnvs(vercel, SOURCE_PROJECT);

  const byKey = new Map();
  for (const env of sourceEnvs) {
    if (!env?.key || BLOCKED.has(env.key)) continue;
    if (!byKey.has(env.key)) byKey.set(env.key, env);
  }

  let copied = 0;
  for (const key of COPY_KEYS) {
    const env = byKey.get(key);
    if (!env?.value) continue;
    await upsertEnv(vercel, TARGET_PROJECT, {
      key,
      value: env.value,
      type: env.type === 'encrypted' ? 'encrypted' : 'plain',
      target: env.target?.length ? env.target : ['production', 'preview', 'development'],
      comment: `Synced from ${SOURCE_PROJECT} (${key})`,
    });
    copied += 1;
    console.log(`synced ${key}`);
  }

  for (const [sourceKey, targetKey] of Object.entries(RENAME_KEYS)) {
    const env = byKey.get(sourceKey);
    if (!env?.value) {
      console.warn(
        `skip ${targetKey}: ${sourceKey} not available (set manually in Vercel if needed)`,
      );
      continue;
    }
    await upsertEnv(vercel, TARGET_PROJECT, {
      key: targetKey,
      value: env.value,
      type: 'encrypted',
      target: ['production', 'preview'],
      comment: `Mapped from ${SOURCE_PROJECT}/${sourceKey} for oweb-backend API provider`,
    });
    copied += 1;
    console.log(`synced ${sourceKey} → ${targetKey}`);
  }

  console.log(`Done. ${copied} variable(s) upserted on ${TARGET_PROJECT}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
