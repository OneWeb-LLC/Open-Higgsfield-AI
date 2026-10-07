import { fetchOneIdHandle, oneIdFromUserMetadata } from '@/lib/oneid';

/** Idempotent local profile projection keyed by auth.users.id — no global auth trigger. */
export async function ensureOhfProfile(supabase, user) {
  const oneId = oneIdFromUserMetadata(user) ?? (await fetchOneIdHandle(supabase, user.id));
  const meta = user.user_metadata ?? {};
  const displayName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email?.split('@')[0] ||
    'Creator';

  const { error } = await supabase.from('ohf_profiles').upsert(
    {
      id: user.id,
      one_id: oneId,
      display_name: displayName,
      avatar_url: typeof meta.avatar_url === 'string' ? meta.avatar_url : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    console.warn('[ohf] profile upsert failed', error.message);
  }
}
