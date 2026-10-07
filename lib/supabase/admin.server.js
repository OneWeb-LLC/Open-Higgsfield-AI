import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/env.server';

let admin;

export function getSupabaseAdmin() {
  if (admin) return admin;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !key) {
    throw new Error('sso_misconfigured');
  }

  admin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return admin;
}

export function getSupabaseAdminOrNull() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}
