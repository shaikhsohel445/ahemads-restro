import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

type Provider = 'resend' | 'sendgrid';

/**
 * Sends email through an HTTPS email API. The self-hosted build spoke SMTP
 * via nodemailer, which needs raw TCP/TLS sockets a Worker cannot rely on;
 * the interface (send / sendEach / isConfigured) is unchanged, so report
 * schedules and marketing campaigns did not change.
 *
 * Configured by environment so no credentials live in the database:
 *   EMAIL_PROVIDER  "resend" (default) or "sendgrid"
 *   EMAIL_API_KEY   provider API key — a Wrangler secret
 *   EMAIL_FROM      "My Cafe <hello@mycafe.com>" (a domain verified with the provider)
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  private get from(): string {
    return this.config.get<string>('EMAIL_FROM') ?? '';
  }

  private get apiKey(): string {
    return this.config.get<string>('EMAIL_API_KEY') ?? '';
  }

  private get provider(): Provider {
    return this.config.get<string>('EMAIL_PROVIDER') === 'sendgrid'
      ? 'sendgrid'
      : 'resend';
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.from;
  }

  async send(mail: OutgoingEmail): Promise<void> {
    if (!this.isConfigured())
      throw new Error('Email is not set up: set EMAIL_API_KEY and EMAIL_FROM');
    const res =
      this.provider === 'sendgrid'
        ? await this.viaSendgrid(mail)
        : await this.viaResend(mail);
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      throw new Error(
        `${this.provider} answered HTTP ${res.status}: ${detail}`,
      );
    }
  }

  /** Sends to many recipients one at a time, returning how many went through. */
  async sendEach(
    mails: OutgoingEmail[],
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    for (const mail of mails) {
      try {
        await this.send(mail);
        sent++;
      } catch (err) {
        failed++;
        this.logger.warn(
          `Email to ${mail.to} failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    return { sent, failed };
  }

  private viaResend(mail: OutgoingEmail) {
    return fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        attachments: mail.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString('base64'),
          content_type: a.contentType,
        })),
      }),
    });
  }

  private viaSendgrid(mail: OutgoingEmail) {
    const from = /^(.*)<(.+)>\s*$/.exec(this.from);
    return fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: mail.to }] }],
        from: from
          ? {
              name: from[1].trim().replace(/^"|"$/g, ''),
              email: from[2].trim(),
            }
          : { email: this.from },
        subject: mail.subject,
        content: [{ type: 'text/plain', value: mail.text }],
        attachments: mail.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString('base64'),
          type: a.contentType,
          disposition: 'attachment',
        })),
      }),
    });
  }
}
