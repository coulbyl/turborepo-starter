import type { Request } from 'express';
import type { UserRole } from '@identis/db';

export type AuthSessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  emailVerified: boolean;
  mfaMethod: 'EMAIL' | 'TOTP' | null;
  totpVerified: boolean;
  avatarUrl: string | null;
  theme: string | null;
  locale: string | null;
};

export type AuthSession = {
  sessionId: string;
  user: AuthSessionUser;
};

export type AuthenticatedRequest = Request & {
  authSession?: AuthSession;
};
