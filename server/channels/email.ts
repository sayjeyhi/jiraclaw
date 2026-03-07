import type { SendChannelMessageInput, ChannelSendResult } from "./types";

/**
 * Email channel sender via SMTP using Bun's built-in smtp client (Bun >= 1.2.3).
 * Requires credentials: smtpHost, smtpPort.
 * Optional credentials: smtpUser, smtpPassword, fromEmail.
 * Recipient is taken from the event recipient field or credentials.to.
 */
export async function sendEmailMessage(input: SendChannelMessageInput): Promise<ChannelSendResult> {
  const { credentials, message, recipient } = input;
  const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail } = credentials;

  if (!smtpHost || !smtpPort) {
    return { success: false, error: "Email: smtpHost and smtpPort required" };
  }

  const to = recipient ?? credentials.to;
  if (!to) {
    return { success: false, error: "Email: recipient address required" };
  }

  const subject = message.ticketKey
    ? `[JiraClaw] [${message.ticketKey}] Bot Notification`
    : "[JiraClaw] Bot Notification";

  const from = fromEmail ?? smtpUser ?? "noreply@jiraclaw.io";

  try {
    // Bun.smtp is available since Bun v1.2.3
    await (Bun as unknown as BunSmtp).smtp.send({
      from: { email: from },
      to: [{ email: to }],
      subject,
      text: message.text,
      smtp: {
        hostname: smtpHost,
        port: Number(smtpPort),
        username: smtpUser,
        password: smtpPassword,
      },
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Email error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// Minimal typing for Bun.smtp to avoid `any`
interface BunSmtp {
  smtp: {
    send(options: {
      from: { email: string };
      to: { email: string }[];
      subject: string;
      text: string;
      smtp: { hostname: string; port: number; username?: string; password?: string };
    }): Promise<void>;
  };
}
