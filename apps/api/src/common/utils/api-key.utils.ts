import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;
const N = 16384;
const R = 8;
const P = 1;

/**
 * Generates a new API key and its hash.
 * Returns { raw, hash, prefix } — raw is shown once, only hash is stored.
 */
export function generateApiKey(env: 'live' | 'sandbox'): {
  raw: string;
  hash: string;
  prefix: string;
} {
  const secret = randomBytes(32).toString('hex');
  const raw = `id_${env}_${secret}`;
  const prefix = raw.substring(0, 12);
  const hash = hashApiKey(raw);
  return { raw, hash, prefix };
}

export function hashApiKey(raw: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(raw, salt, KEYLEN, { N, r: R, p: P }).toString('hex');
  return `${N}:${R}:${P}:${salt}:${hash}`;
}

export function verifyApiKey(raw: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 5) return false;
  const [n, r, p, salt, expected] = parts;
  try {
    const actual = scryptSync(raw, salt, KEYLEN, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return timingSafeEqual(Buffer.from(expected, 'hex'), actual);
  } catch {
    return false;
  }
}
