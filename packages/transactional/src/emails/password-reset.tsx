import { Button, Heading, Section, Text } from "@react-email/components";
import { createElement } from "react";
import { renderEmail } from "../render";
import { type PasswordResetProps } from "../types";
import { AppLayout } from "../components/app-layout";
import { palette } from "../components/palette";

const styles = {
  heading: {
    color: palette.text.primary,
    fontSize: "20px",
    margin: "0 0 12px",
  },
  intro: {
    color: palette.text.secondary,
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 20px",
  },
  buttonContainer: {
    margin: "0 0 20px",
    textAlign: "center" as const,
  },
  button: {
    backgroundColor: palette.brand,
    borderRadius: "6px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 24px",
    textDecoration: "none",
  },
  fallback: {
    color: palette.text.subtle,
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 4px",
  },
  link: {
    color: palette.text.subtle,
    fontSize: "11px",
    wordBreak: "break-all" as const,
    margin: 0,
  },
  expiry: {
    color: palette.text.subtle,
    fontSize: "12px",
    margin: "16px 0 0",
  },
} as const;

export function PasswordResetEmail({
  username,
  resetUrl,
  expiresInMinutes,
  isAdminGenerated,
}: PasswordResetProps) {
  return (
    <AppLayout preview="Reset your password">
      <Heading style={styles.heading}>Password Reset</Heading>
      <Section>
        <Text style={styles.intro}>
          Hello {username},{" "}
          {isAdminGenerated
            ? "an administrator has generated this reset link for you."
            : "you requested to reset your password."}{" "}
          Click the button below to choose a new password.
        </Text>
        <Section style={styles.buttonContainer}>
          <Button href={resetUrl} style={styles.button}>
            Reset my password
          </Button>
        </Section>
        <Text style={styles.fallback}>
          If the button does not work, copy this link into your browser:
        </Text>
        <Text style={styles.link}>{resetUrl}</Text>
        <Text style={styles.expiry}>
          This link expires in {expiresInMinutes} minutes.
        </Text>
      </Section>
    </AppLayout>
  );
}

export const renderPasswordReset = (props: PasswordResetProps) =>
  renderEmail(createElement(PasswordResetEmail, props));

export default function PasswordResetPreview() {
  return (
    <PasswordResetEmail
      username="johndoe"
      resetUrl="https://starter.app/auth/reset-password?token=abc123"
      expiresInMinutes={15}
      isAdminGenerated={false}
    />
  );
}
