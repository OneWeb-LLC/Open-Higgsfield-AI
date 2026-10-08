/** @typedef {'proxy' | 'direct'} ApiProviderMode */

/**
 * @typedef {Object} ApiProvider
 * @property {string} id
 * @property {string} label
 * @property {string} [description]
 * @property {ApiProviderMode} mode
 * @property {string} [proxyPath] - browser path when mode=proxy
 * @property {string} [upstream] - server-only upstream base URL
 * @property {string} [signupUrl]
 * @property {string} [keyHint]
 */

const MUAPI_UPSTREAM = (process.env.MUAPI_UPSTREAM || 'https://api.muapi.ai').replace(/\/$/, '');

/** @type {ApiProvider[]} */
export const DEFAULT_API_PROVIDERS = [
  {
    id: 'muapi-proxy',
    label: 'MuAPI (satellite proxy)',
    description: 'Routes through this app — recommended on Vercel (avoids CORS).',
    mode: 'proxy',
    proxyPath: '/api/muapi',
    upstream: MUAPI_UPSTREAM,
    signupUrl: 'https://muapi.ai',
    keyHint: 'Muapi.ai API key (x-api-key)',
  },
  {
    id: 'muapi-direct',
    label: 'MuAPI (direct)',
    description: 'Browser calls api.muapi.ai directly (needs MuAPI CORS).',
    mode: 'direct',
    upstream: MUAPI_UPSTREAM,
    signupUrl: 'https://muapi.ai',
    keyHint: 'Muapi.ai API key (x-api-key)',
  },
];

function parseJsonProviders(raw) {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('NEXT_PUBLIC_OHF_API_PROVIDERS must be a non-empty JSON array');
  }
  return parsed;
}

/**
 * Full provider list (server): includes upstream URLs for proxies.
 * @returns {ApiProvider[]}
 */
export function getApiProviders() {
  const raw = process.env.NEXT_PUBLIC_OHF_API_PROVIDERS;
  if (raw) {
    try {
      return parseJsonProviders(raw);
    } catch (err) {
      console.warn('[ohf] invalid NEXT_PUBLIC_OHF_API_PROVIDERS', err?.message ?? err);
    }
  }

  /** @type {ApiProvider[]} */
  const providers = DEFAULT_API_PROVIDERS.map((p) => ({ ...p }));

  const owebBackend = process.env.OHF_OWEB_BACKEND_API_UPSTREAM || process.env.BACKEND_API_URL;
  if (owebBackend) {
    providers.push({
      id: 'oweb-backend',
      label: process.env.NEXT_PUBLIC_OHF_OWEB_BACKEND_LABEL || 'OWeb backend API',
      description: 'Generative gateway from the OWeb Vercel project (MuAPI-compatible proxy path).',
      mode: 'proxy',
      proxyPath: '/api/ohf/upstream/oweb-backend',
      upstream: owebBackend.replace(/\/$/, ''),
      signupUrl: 'https://muapi.ai',
      keyHint: 'API key accepted by the OWeb backend gateway',
    });
  }

  const customUpstream = process.env.OHF_CUSTOM_API_UPSTREAM;
  if (customUpstream) {
    providers.push({
      id: 'custom',
      label: process.env.NEXT_PUBLIC_OHF_CUSTOM_API_LABEL || 'Custom API',
      description: 'Extra upstream configured via OHF_CUSTOM_API_UPSTREAM.',
      mode: 'proxy',
      proxyPath: '/api/ohf/upstream/custom',
      upstream: customUpstream.replace(/\/$/, ''),
      keyHint: 'API key for the custom upstream',
    });
  }

  return providers;
}

/**
 * Safe for the browser: no secret upstream URLs for custom/oweb entries.
 * @returns {Omit<ApiProvider, 'upstream'>[]}
 */
export function getPublicApiProviders() {
  return getApiProviders().map((p) => {
    if (p.mode === 'direct') return { ...p };
    const { upstream, ...rest } = p;
    return rest;
  });
}

/**
 * @param {string} providerId
 * @returns {ApiProvider | undefined}
 */
export function getApiProviderById(providerId) {
  return getApiProviders().find((p) => p.id === providerId);
}

export function getDefaultApiProviderId() {
  const fromEnv = process.env.NEXT_PUBLIC_OHF_DEFAULT_API_PROVIDER;
  const providers = getPublicApiProviders();
  if (fromEnv && providers.some((p) => p.id === fromEnv)) return fromEnv;
  return providers[0]?.id ?? 'muapi-proxy';
}
