import { configureGenerativeClient } from 'studio';

/**
 * @param {{ mode: 'proxy' | 'direct', proxyPath?: string, upstream?: string }} provider
 */
export function applyGenerativeProvider(provider) {
  if (!provider) return;
  if (provider.mode === 'direct') {
    configureGenerativeClient({
      mode: 'direct',
      directUpstream: provider.upstream || 'https://api.muapi.ai',
    });
    return;
  }
  configureGenerativeClient({
    mode: 'proxy',
    proxyPath: provider.proxyPath || '/api/muapi',
    directUpstream: provider.upstream || 'https://api.muapi.ai',
  });
}
