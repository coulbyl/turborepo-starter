import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { type PropsWithChildren } from "react";
import { palette } from "./palette";

const styles = {
  body: {
    backgroundColor: palette.bg.page,
    fontFamily: '"Courier New", Courier, monospace',
    margin: 0,
    padding: "28px 0",
  },
  container: {
    backgroundColor: palette.bg.surface,
    border: `1px solid ${palette.border.default}`,
    borderRadius: "8px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "24px",
  },
  brandSection: {
    marginBottom: "4px",
  },
  brand: {
    color: palette.brand,
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "3px",
    margin: 0,
  },
  tagline: {
    color: palette.text.subtle,
    fontSize: "11px",
    margin: "2px 0 0",
  },
  divider: {
    borderColor: palette.border.default,
    margin: "16px 0",
  },
  footer: {
    color: palette.text.subtle,
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
  },
} as const;

type AppLayoutProps = PropsWithChildren<{
  preview: string;
}>;

export function AppLayout({ preview, children }: AppLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.brandSection}>
            <Text style={styles.brand}>STARTER</Text>
            <Text style={styles.tagline}>Turborepo Starter</Text>
          </Section>

          <Hr style={styles.divider} />

          {children}

          <Hr style={styles.divider} />

          <Text style={styles.footer}>
            Automated notification — please do not reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
