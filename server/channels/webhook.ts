import type { SendChannelMessageInput, ChannelSendResult } from "./types";

/**
 * Generic HTTP webhook channel sender.
 * Posts a JSON payload to the configured URL.
 * Optional credentials.secret is sent as X-JiraClaw-Signature header.
 */
export async function sendWebhookMessage(
  input: SendChannelMessageInput,
): Promise<ChannelSendResult> {
  const { credentials, message } = input;
  const { url, secret } = credentials;

  if (!url) {
    return { success: false, error: "Webhook: url required" };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) {
    headers["X-JiraClaw-Signature"] = secret;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: message.text,
      botId: message.botId,
      ticketKey: message.ticketKey,
      metadata: message.metadata,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return {
      success: false,
      error: `Webhook error ${res.status}: ${body.slice(0, 300)}`,
    };
  }
  return { success: true };
}
