import { NextResponse } from 'next/server';
import { redeemEcosystemLaunchToken } from '@/lib/sso/redeem-launch-token.server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const launchToken = typeof body.launch_token === 'string' ? body.launch_token : '';
    const result = await redeemEcosystemLaunchToken(launchToken);
    return NextResponse.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      orgId: result.orgId,
      userId: result.userId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'sso_failed';
    const status =
      message === 'sso_misconfigured'
        ? 503
        : message.includes('launch_token') || message === 'missing_launch_token'
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
