export type AuthSessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "ADMIN" | "MEMBER";
  emailVerified: boolean;
  mfaMethod: "EMAIL" | "TOTP" | null;
  totpVerified: boolean;
  avatarUrl: string | null;
  theme: string | null;
  locale: string | null;
};

export function isAccountVerified(user: AuthSessionUser): boolean {
  return user.emailVerified || user.totpVerified;
}

export type AuthSession = {
  sessionId: string;
  user: AuthSessionUser;
};
