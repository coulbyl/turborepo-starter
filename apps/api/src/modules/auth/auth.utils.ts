import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from 'node:crypto';
import * as argon2 from 'argon2';
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_TTL_MS,
  COOKIE_DOMAIN,
} from './auth.constants';

export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, password);
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function parseCookieHeader(
  cookieHeader?: string,
): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
    const index = pair.indexOf('=');
    if (index === -1) return acc;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export function buildSessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${AUTH_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(AUTH_SESSION_TTL_MS / 1000)}`,
  ];
  if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + (randomBytes(4).readUInt32BE(0) % 900000)));
}

export function hashOtpCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function generateResetToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const AES_ALGO = 'aes-256-gcm';
const AES_KEY_LEN = 32;
const AES_IV_LEN = 12;
const AES_TAG_LEN = 16;

function deriveAesKey(secret: string): Buffer {
  return scryptSync(secret, 'identis-totp-salt', AES_KEY_LEN);
}

export function encryptTotpSecret(
  plaintext: string,
  appSecret: string,
): string {
  const key = deriveAesKey(appSecret);
  const iv = randomBytes(AES_IV_LEN);
  const cipher = createCipheriv(AES_ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptTotpSecret(
  ciphertext: string,
  appSecret: string,
): string {
  const key = deriveAesKey(appSecret);
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, AES_IV_LEN);
  const tag = buf.subarray(AES_IV_LEN, AES_IV_LEN + AES_TAG_LEN);
  const encrypted = buf.subarray(AES_IV_LEN + AES_TAG_LEN);
  const decipher = createDecipheriv(AES_ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

export function buildExpiredSessionCookie(secure: boolean): string {
  const parts = [
    `${AUTH_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);
  if (secure) parts.push('Secure');
  return parts.join('; ');
}
