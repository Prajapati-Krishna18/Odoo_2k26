/**
 * @file    email.service.ts
 * @desc    Pluggable Email Service infrastructure supporting SMTP, SendGrid, and Mailtrap.
 */

// ── Email Provider Interface ──────────────────────────────────

export interface EmailProvider {
  name: string;
  send(to: string, subject: string, body: string): Promise<void>;
}

// ── Smtp / Mailtrap Provider ──────────────────────────────────

class SmtpEmailProvider implements EmailProvider {
  name = "smtp";

  async send(to: string, subject: string, body: string): Promise<void> {
    // In production, this would initialize nodemailer or a real SMTP transport.
    // In hackathon/development environment, we print a structured output.
    console.log(`✉️  [SMTP] Email sent to: <${to}>\nSubject: "${subject}"\nBody: "${body}"\n`);
  }
}

class MailtrapEmailProvider implements EmailProvider {
  name = "mailtrap";

  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`✉️  [Mailtrap - Development] Email sent to: <${to}>\nSubject: "${subject}"\nBody: "${body}"\n`);
  }
}

// ── SendGrid Provider Interface ───────────────────────────────

class SendGridEmailProvider implements EmailProvider {
  name = "sendgrid";

  async send(to: string, subject: string, body: string): Promise<void> {
    // In production, this would call @sendgrid/mail API client.
    console.log(`✉️  [SendGrid - Cloud API] Email sent to: <${to}>\nSubject: "${subject}"\nBody: "${body}"\n`);
  }
}

// ── Reusable Email Service Manager ────────────────────────────

export class EmailService {
  private static provider: EmailProvider = new MailtrapEmailProvider(); // Default to Mailtrap development

  /**
   * Configure the active email provider dynamically at runtime.
   */
  static setProvider(provider: EmailProvider) {
    this.provider = provider;
    console.log(`✉️  Email service provider swapped to: '${provider.name}'`);
  }

  /**
   * Shared send method used by other modules (Auth, Notification, Maintenance).
   */
  static async send(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.provider.send(to, subject, body);
    } catch (err) {
      console.error(`❌  Failed to send email to <${to}> using '${this.provider.name}':`, err);
    }
  }
}

// ── Initialize Provider based on env variables ────────────────

const activeProvider = (process.env["EMAIL_PROVIDER"] || "mailtrap").toLowerCase();
if (activeProvider === "smtp") {
  EmailService.setProvider(new SmtpEmailProvider());
} else if (activeProvider === "sendgrid") {
  EmailService.setProvider(new SendGridEmailProvider());
} else {
  EmailService.setProvider(new MailtrapEmailProvider());
}
