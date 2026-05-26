export type RenderedEmail = {
  html: string;
  text: string;
};

export type EmailVerificationProps = {
  username: string;
  code: string;
  expiresInMinutes: number;
};

export type PasswordResetProps = {
  username: string;
  resetUrl: string;
  expiresInMinutes: number;
  isAdminGenerated: boolean;
};
