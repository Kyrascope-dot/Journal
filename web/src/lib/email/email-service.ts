import { Resend } from "resend";
import {
  assertValidRecipientEmail,
  formatResendError,
  formatResendFromAddress,
} from "@/lib/email/format-address";
import { siteConfig } from "@/lib/site-config";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailSendResult = {
  messageId: string | null;
  deliveryStatus: "sent";
};

export class EmailService {
  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY?.trim());
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

    let from: string;
    try {
      from = formatResendFromAddress(process.env.EMAIL_FROM);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "EMAIL_FROM is invalid. Check the Vercel environment variable."
      );
    }

    let replyTo: string;
    try {
      replyTo = assertValidRecipientEmail(
        process.env.EDITORIAL_EMAIL ?? siteConfig.email,
        "Reply-to"
      );
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "EDITORIAL_EMAIL is invalid. Check the Vercel environment variable."
      );
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: assertValidRecipientEmail(message.to),
      replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) throw new Error(formatResendError(error.message));
    return { messageId: data?.id ?? null, deliveryStatus: "sent" };
  }
}

export const emailService = new EmailService();
