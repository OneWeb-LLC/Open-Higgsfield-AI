/**
 * Browser-only storage for user BYOK API keys (AES-GCM, device-local wrapping key).
 * Legacy plaintext values are migrated on read.
 */

const DEVICE_WRAP_KEY = 'ohf_device_wrap_key_v1';

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getWrapKey() {
  let stored = localStorage.getItem(DEVICE_WRAP_KEY);
  if (!stored) {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    stored = bytesToBase64(raw);
    localStorage.setItem(DEVICE_WRAP_KEY, stored);
  }
  const rawBytes = base64ToBytes(stored);
  return crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * @param {string} storageKey
 * @param {string} secret
 */
export async function saveClientSecret(storageKey, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapKey = await getWrapKey();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrapKey,
    new TextEncoder().encode(secret),
  );
  const payload = {
    v: 1,
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  };
  localStorage.setItem(storageKey, JSON.stringify(payload));
}

/**
 * @param {string} storageKey
 * @returns {Promise<string | null>}
 */
export async function loadClientSecret(storageKey) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.v === 1 && parsed.iv && parsed.data) {
      const wrapKey = await getWrapKey();
      const plainBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(parsed.iv) },
        wrapKey,
        base64ToBytes(parsed.data),
      );
      return new TextDecoder().decode(plainBuffer);
    }
  } catch {
    /* fall through — legacy plaintext */
  }

  if (raw.length > 0 && !raw.startsWith('{')) {
    await saveClientSecret(storageKey, raw);
    return raw;
  }

  return null;
}

/**
 * @param {string} storageKey
 */
export async function removeClientSecret(storageKey) {
  localStorage.removeItem(storageKey);
}
