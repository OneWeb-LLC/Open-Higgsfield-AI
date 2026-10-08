import assert from 'node:assert/strict';
import test from 'node:test';

test('default API providers include proxy and direct MuAPI', async () => {
  const { DEFAULT_API_PROVIDERS, getPublicApiProviders } = await import('../lib/ohf/api-providers.js');
  assert.equal(DEFAULT_API_PROVIDERS.length, 2);
  const pub = getPublicApiProviders();
  assert.ok(pub.some((p) => p.id === 'muapi-proxy'));
  assert.ok(pub.some((p) => p.id === 'muapi-direct'));
  const direct = pub.find((p) => p.id === 'muapi-direct');
  assert.equal(direct.mode, 'direct');
  assert.ok(direct.upstream?.includes('muapi'));
});

test('public providers hide proxy upstream URLs', async () => {
  const { getPublicApiProviders } = await import('../lib/ohf/api-providers.js');
  const proxy = getPublicApiProviders().find((p) => p.id === 'muapi-proxy');
  assert.equal(proxy.mode, 'proxy');
  assert.equal(proxy.upstream, undefined);
});
