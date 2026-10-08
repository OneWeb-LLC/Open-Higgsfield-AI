import { NextResponse } from 'next/server';

/**
 * @param {Request} request
 * @param {{ params: Promise<{ path?: string[] }> }} context
 * @param {string} upstreamBase
 */
export async function proxyToUpstream(request, context, upstreamBase) {
  const base = upstreamBase.replace(/\/$/, '');
  const { path } = await context.params;
  const segments = Array.isArray(path) ? path : [];
  const upstreamPath = segments.map(encodeURIComponent).join('/');
  const upstreamUrl = new URL(`${base}/${upstreamPath}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) headers.set('x-api-key', apiKey);

  const authorization = request.headers.get('authorization');
  if (authorization) headers.set('authorization', authorization);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);

  /** @type {RequestInit} */
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
    console.error('[upstream proxy] fetch failed', upstreamBase, err?.message ?? err);
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
