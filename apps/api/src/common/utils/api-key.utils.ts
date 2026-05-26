import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';

export async function generateApiKey(env: 'live' | 'sandbox'): Promise<{
  raw: string;
  hash: string;
  prefix: string;
}> {
  const secret = randomBytes(32).toString('hex');
  const raw = `id_${env}_${secret}`;
  const prefix = raw.substring(0, 12);
  const hash = await hashApiKey(raw);
  return { raw, hash, prefix };
}

export async function hashApiKey(raw: string): Promise<string> {
  return argon2.hash(raw, { type: argon2.argon2id });
}

export async function verifyApiKey(
  raw: string,
  stored: string,
): Promise<boolean> {
  try {
    return await argon2.verify(stored, raw);
  } catch {
    return false;
  }
}
