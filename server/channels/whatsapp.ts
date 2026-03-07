import type { SendChannelMessageInput, ChannelSendResult } from "./types";

const WHATSAPP_API_VERSION = "v19.0";

/**
 * WhatsApp channel sender via Meta Cloud API.
 * Requires credentials.phoneNumberId, credentials.accessToken and event recipient (destination phone number).
 */
export async function sendWhatsAppMessage(
  input: SendChannelMessageInput,
): Promise<ChannelSendResult> {
  const { credentials, message, recipient } = input;
  const { phoneNumberId, accessToken } = credentials;

  if (!phoneNumberId || !accessToken) {
    return { success: false, error: "WhatsApp: phoneNumberId and accessToken required" };
  }
  if (!recipient) {
    return {
      success: false,
      error: "WhatsApp: recipient phone number required (pass via recipient field)",
    };
  }

  const text = message.ticketKey ? `[${message.ticketKey}] ${message.text}` : message.text;

  const res = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body: text },
      }),
    },
  );

  const data = (await res.json()) as {
    messages?: { id: string }[];
    error?: { message: string; code: number };
  };

  if (data.error) {
    return { success: false, error: `WhatsApp error (${data.error.code}): ${data.error.message}` };
  }
  return { success: true, externalId: data.messages?.[0]?.id };
}
