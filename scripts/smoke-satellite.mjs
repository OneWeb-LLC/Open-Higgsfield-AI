/**
 * Static satellite readiness smoke (no network).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const envExample = readFileSync(resolve(root, '.env.example'), 'utf8');
assert(envExample.includes('SUPABASE_SERVICE_ROLE_KEY'), 'env.example missing SERVICE_ROLE');
assert(envExample.includes('NEXT_PUBLIC_OHF_REQUIRE_AUTH=true'), 'env.example must document REQUIRE_AUTH');
assert(envExample.includes('ebjzdcnphkfpxfldnatm'), 'env.example must pin One OS project id');
assert(envExample.includes('auth.oweb.one'), 'env.example must use auth.oweb.one');

assert(existsSync(resolve(root, 'docs/SATELLITE.md')), 'missing docs/SATELLITE.md');
assert(
  existsSync(resolve(root, 'supabase/migrations/20261007220000_ohf_profiles_isolation.sql')),
  'missing ohf_profiles migration',
);

const constants = readFileSync(resolve(root, 'lib/ohf/constants.js'), 'utf8');
assert(constants.includes("OHF_APP_ID = 'open-higgsfield-ai'"), 'app id must be open-higgsfield-ai');
assert(constants.includes('ao-supabase-auth'), 'shared session key ao-supabase-auth required');

const client = readFileSync(resolve(root, 'lib/supabase/client.js'), 'utf8');
assert(
  client.includes('SUPABASE_AUTH_STORAGE_KEY') || client.includes('ao-supabase-auth'),
  'browser client must use shared ao-supabase-auth storage key',
);

const isolationSql = readFileSync(
  resolve(root, 'supabase/migrations/20261007220000_ohf_profiles_isolation.sql'),
  'utf8',
);
assert(isolationSql.includes('FORCE ROW LEVEL SECURITY'), 'ohf migration must FORCE RLS');
assert(
  !/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.ohf_is_workspace_member/i.test(
    isolationSql,
  ),
  'ohf migration must not create SECURITY DEFINER workspace helpers',
);
assert(
  isolationSql.includes('DROP FUNCTION IF EXISTS public.ohf_is_workspace_member'),
  'ohf migration should drop unused draft helper if present',
);
assert(
  isolationSql.includes('(SELECT auth.uid()) = id'),
  'ohf_profiles_self must compare auth.uid() to id',
);

if (failures.length) {
  console.error('smoke:satellite FAILED');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}

console.log('smoke:satellite OK');
