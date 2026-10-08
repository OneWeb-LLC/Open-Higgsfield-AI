import { redirect } from 'next/navigation';
import StandaloneShell from '@/components/StandaloneShell';
import { getDefaultApiProviderId, getPublicApiProviders } from '@/lib/ohf/api-providers';
import { isAuthRequired } from '@/lib/ohf/constants';
import { formatOneId, fetchOneIdHandle, oneIdFromUserMetadata } from '@/lib/oneid';
import { createClient } from '@/lib/supabase/server';
import { establishProductSession } from '@/lib/workspace/session.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Studio — Open Higgsfield AI',
};

export default async function StudioPage() {
  const apiProviders = getPublicApiProviders();
  const defaultProviderId = getDefaultApiProviderId();
  const shellProps = { apiProviders, defaultProviderId };

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    if (isAuthRequired()) redirect('/login?next=/studio');
    return <StandaloneShell {...shellProps} />;
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
      persistCookie: false,
    });
    workspaceId = ctx.workspaceId;
    const handle =
      oneIdFromUserMetadata(user) ?? (await fetchOneIdHandle(supabase, user.id));
    oneIdLabel = formatOneId(handle);
  }

  return (
    <StandaloneShell
      {...shellProps}
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
      oneId={oneIdLabel}
      workspaceId={workspaceId}
    />
  );
}
