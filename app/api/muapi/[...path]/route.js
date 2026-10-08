import { NextResponse } from 'next/server';

const UPSTREAM = 'https://api.muapi.ai';

async function proxyRequest(request, context) {
  const { path } = await context.params;
  const segments = Array.isArray(path) ? path : [];
  const upstreamPath = segments.map(encodeURIComponent).join('/');
  const upstreamUrl = new URL(`${UPSTREAM}/${upstreamPath}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) headers.set('x-api-key', apiKey);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);

  const init = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, init);
  } catch (err) {
    console.error('[muapi proxy] upstream fetch failed', err?.message ?? err);
    return NextResponse.json({ error: 'upstream_unreachable' }, { status: 502 });
  }

  const responseHeaders = new Headers();
  const upstreamType = upstreamResponse.headers.get('content-type');
  if (upstreamType) responseHeaders.set('content-type', upstreamType);

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
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
