import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  renderEmailVerification,
  renderPasswordReset,
  type EmailVerificationProps,
  type PasswordResetProps,
} from '@starter/transactional';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: Transporter | null = null;
  private readonly smtpEnabled: boolean;
  private readonly smtpFrom: string;

  constructor(private readonly config: ConfigService) {
    this.smtpEnabled = config.get<string>('SMTP_ENABLED', 'false') !== 'false';
    this.smtpFrom = config.get<string>('SMTP_FROM', 'starter@localhost');
  }

  onModuleInit(): void {
    if (!this.smtpEnabled) return;

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 1025),
      secure: this.config.get<string>('SMTP_SECURE', 'false') !== 'false',
      auth: this.config.get<string>('SMTP_USER')
        ? {
            user: this.config.get<string>('SMTP_USER'),
            pass: this.config.get<string>('SMTP_PASSWORD'),
          }
        : undefined,
    });
  }

  async sendEmailVerification(
    to: string,
    props: EmailVerificationProps,
  ): Promise<void> {
    const { html, text } = await renderEmailVerification(props);
    await this.sendTo(to, 'Verify your email', { html, text });
  }

  async sendPasswordReset(
    to: string,
    props: PasswordResetProps,
  ): Promise<void> {
    const { html, text } = await renderPasswordReset(props);
    await this.sendTo(to, 'Reset your password', { html, text });
  }

  private async sendTo(
    to: string,
    subject: string,
    body: { html: string; text: string },
  ): Promise<void> {
    if (!this.smtpEnabled || !this.transporter) {
      return;
    }

    await this.transporter.sendMail({
      from: this.smtpFrom,
      to,
      subject: `[Starter] ${subject}`,
      html: body.html,
      text: body.text,
    });
  }
}
