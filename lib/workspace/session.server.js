import { cookies } from 'next/headers';
import {
  activateOpenHiggsfieldApp,
  activateOpenHiggsfieldWorkspace,
} from '@/lib/ohf/activation';
import { ensureOhfProfile } from '@/lib/ohf/ensure-profile';
import { getSupabaseAdminOrNull } from '@/lib/supabase/admin.server';
import { requireWorkspaceMember } from '@/lib/workspace/authz.server';
import { resolveActivatedWorkspaceContext } from '@/lib/workspace/resolve-activated-workspace';
import {
  ensurePersonalWorkspace,
  fetchMyWorkspaces,
} from '@/lib/workspace/workspace-queries';

export const WORKSPACE_COOKIE = 'ohf_workspace_id';

export async function readRequestedWorkspaceId() {
  const cookieStore = await cookies();
  return cookieStore.get(WORKSPACE_COOKIE)?.value ?? null;
}

export async function persistWorkspaceIdCookie(workspaceId) {
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

/**
 * Canonical workspace resolution + activation for an authenticated session (server-side).
 */
export async function establishProductSession(supabase, user, options = {}) {
  const accessToken = options.accessToken ?? null;
  const activationKind = options.activationKind ?? 'sign_in';
  const requestedFromOptions = options.requestedWorkspaceId ?? null;
  const requested =
    requestedFromOptions ?? (await readRequestedWorkspaceId());

  const meta = user.user_metadata ?? {};
  const displayName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email?.split('@')[0] ||
    'Creator';

  let workspaces = await fetchMyWorkspaces(supabase, user.id);
  if (!workspaces.length) {
    const personalId = await ensurePersonalWorkspace(supabase, user.id, displayName);
    if (personalId) {
      workspaces = await fetchMyWorkspaces(supabase, user.id);
    }
  }

  const { workspaceId, fallbackUsed } = await resolveActivatedWorkspaceContext(supabase, {
    userId: user.id,
    requestedWorkspaceId: requested,
    memberWorkspaces: workspaces,
  });

  let resolvedId = workspaceId;
  if (!resolvedId && workspaces.length) {
    resolvedId = workspaces.find((w) => w.kind === 'personal')?.id ?? workspaces[0].id;
  }

  if (resolvedId) {
    const admin = getSupabaseAdminOrNull();
    if (admin) {
      try {
        await requireWorkspaceMember(admin, resolvedId, user.id);
      } catch (err) {
        console.warn('[ohf] workspace authz failed', err?.message ?? err);
        resolvedId = null;
      }
    }
  }

  if (resolvedId) {
    await persistWorkspaceIdCookie(resolvedId);
    const wsKind =
      activationKind === 'sso_launch'
        ? 'sso_launch'
        : fallbackUsed
          ? 'sign_in'
          : activationKind;
    await activateOpenHiggsfieldWorkspace(
      supabase,
      user.id,
      resolvedId,
      accessToken,
      wsKind,
    );
  }

  await activateOpenHiggsfieldApp(supabase, user.id, accessToken, activationKind);
  await ensureOhfProfile(supabase, user);

  return {
    workspaceId: resolvedId,
    fallbackUsed,
    workspaces,
  };
}
