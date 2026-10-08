import { getApiProviderById } from '@/lib/ohf/api-providers';
import { proxyToUpstream } from '@/lib/ohf/upstream-proxy';

const MUAPI_PROVIDER = () =>
  getApiProviderById('muapi-proxy')?.upstream || process.env.MUAPI_UPSTREAM || 'https://api.muapi.ai';

async function proxyRequest(request, context) {
  return proxyToUpstream(request, context, MUAPI_PROVIDER());
}

export async function GET(request, context) {
  return proxyRequest(request, context);
}

export async function POST(request, context) {
  return proxyRequest(request, context);
}

export async function PUT(request, context) {
  return proxyRequest(request, context);
}

export async function PATCH(request, context) {
  return proxyRequest(request, context);
}

export async function DELETE(request, context) {
  return proxyRequest(request, context);
}

export async function HEAD(request, context) {
  return proxyRequest(request, context);
}

export const dynamic = 'force-dynamic';
