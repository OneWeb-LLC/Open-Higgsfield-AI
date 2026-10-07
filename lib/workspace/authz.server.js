/**
 * Server-side workspace authorization (mirrors OWeb `authz.server.ts` subset).
 * UI hiding is not security — enforce on server routes.
 */

export class WorkspaceAuthorizationError extends Error {
  constructor(permission) {
    super(`Missing workspace permission: ${permission}`);
    this.name = 'WorkspaceAuthorizationError';
    this.permission = permission;
  }
}

export async function loadWorkspaceMembership(admin, workspaceId, userId) {
  const { data: superRow } = await admin
    .from('ao_user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'super_admin')
    .maybeSingle();

  const { data: membership, error } = await admin
    .from('ao_org_members')
    .select('role')
    .eq('org_id', workspaceId)
    .eq('user_id', userId)
    .is('left_at', null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!membership) {
    if (superRow) {
      return { role: 'owner', isSuperAdmin: true };
    }
    throw new WorkspaceAuthorizationError('workspace.view');
  }

  return { role: membership.role, isSuperAdmin: false };
}

/** Assert the user is an active member of the workspace (server-only). */
export async function requireWorkspaceMember(admin, workspaceId, userId) {
  return loadWorkspaceMembership(admin, workspaceId, userId);
}
