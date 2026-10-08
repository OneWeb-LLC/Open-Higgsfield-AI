import { NextResponse } from 'next/server';
import { getApiProviderById } from '@/lib/ohf/api-providers';
import { proxyToUpstream } from '@/lib/ohf/upstream-proxy';

export const dynamic = 'force-dynamic';

async function handle(request, context) {
  const { providerId } = await context.params;
  const provider = getApiProviderById(providerId);

  if (!provider || provider.mode !== 'proxy' || !provider.upstream) {
    return NextResponse.json({ error: 'unknown_provider' }, { status: 404 });
  }

  return proxyToUpstream(request, context, provider.upstream);
}

export async function GET(request, context) {
  return handle(request, context);
}
export async function POST(request, context) {
  return handle(request, context);
}
export async function PUT(request, context) {
  return handle(request, context);
}
export async function PATCH(request, context) {
  return handle(request, context);
}
export async function DELETE(request, context) {
  return handle(request, context);
}
export async function HEAD(request, context) {
  return handle(request, context);
}
