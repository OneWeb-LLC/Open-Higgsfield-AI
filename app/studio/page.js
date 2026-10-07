import { redirect } from 'next/navigation';
import StandaloneShell from '@/components/StandaloneShell';
import { isAuthRequired } from '@/lib/ohf/constants';
import { formatOneId, fetchOneIdHandle, oneIdFromUserMetadata } from '@/lib/oneid';
import { createClient } from '@/lib/supabase/server';
import { establishProductSession } from '@/lib/workspace/session.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Studio — Open Higgsfield AI',
};

export default async function StudioPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    if (isAuthRequired()) redirect('/login?next=/studio');
    return <StandaloneShell />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAuthRequired() && !user) {
    redirect('/login?next=/studio');
  }

  let workspaceId = null;
  let oneIdLabel = null;

  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const ctx = await establishProductSession(supabase, user, {
      accessToken: session?.access_token ?? null,
      activationKind: 'sign_in',
    });
    workspaceId = ctx.workspaceId;
    const handle =
      oneIdFromUserMetadata(user) ?? (await fetchOneIdHandle(supabase, user.id));
    oneIdLabel = formatOneId(handle);
  }

  return (
    <StandaloneShell
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
      oneId={oneIdLabel}
      workspaceId={workspaceId}
    />
  );
}
