import { createHash } from 'node:crypto';
import { OHF_APP_ID } from '@/lib/ohf/constants';
import { assertServiceRoleConfigured } from '@/lib/env.server';
import { getSupabaseAdmin } from '@/lib/supabase/admin.server';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Redeem a one-time OWeb ecosystem launch token (minted by OWeb App Store / SSO).
 * Server-only — uses service role to read `ao_ecosystem_launch_tokens`.
 */
export async function redeemEcosystemLaunchToken(launchToken) {
  assertServiceRoleConfigured();
  const trimmed = launchToken.trim();
  if (!trimmed) throw new Error('missing_launch_token');

  const tokenHash = hashToken(trimmed);
  const now = new Date().toISOString();
  const admin = getSupabaseAdmin();

  const { data: row, error } = await admin
    .from('ao_ecosystem_launch_tokens')
    .select(
      'id, app_id, org_id, user_id, access_token, refresh_token, expires_at, consumed_at',
    )
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) throw new Error('invalid_launch_token');
  if (row.consumed_at) throw new Error('launch_token_consumed');
  if (row.expires_at <= now) throw new Error('launch_token_expired');
  if (row.app_id !== OHF_APP_ID) throw new Error('launch_token_wrong_app');

  const { error: consumeError } = await admin
    .from('ao_ecosystem_launch_tokens')
    .update({ consumed_at: now })
    .eq('id', row.id)
    .is('consumed_at', null);

  if (consumeError) throw new Error(consumeError.message);

  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    orgId: row.org_id,
    userId: row.user_id,
  };
}
