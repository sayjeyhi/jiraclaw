import type { SendChannelMessageInput, ChannelSendResult } from "./types";

/**
 * Slack channel sender.
 * Supports two modes:
 *  1. Incoming Webhook (credentials.webhookUrl) - simpler, routes to a fixed channel
 *  2. Bot Token API (credentials.botToken + credentials.channel) - more flexible
 *
 * Webhook mode takes priority if both are configured.
 */
export async function sendSlackMessage(input: SendChannelMessageInput): Promise<ChannelSendResult> {
  const { credentials, message } = input;
  const { webhookUrl, botToken, channel } = credentials;

  if (webhookUrl) {
    const payload: Record<string, unknown> = {};

    if (message.ticketKey) {
      payload.blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*[${message.ticketKey}]* ${message.text}`,
          },
        },
      ];
    } else {
      payload.text = message.text;
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Slack webhook error ${res.status}: ${body}` };
    }
    return { success: true };
  }

  if (botToken && channel) {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel,
        text: message.ticketKey ? `[${message.ticketKey}] ${message.text}` : message.text,
      }),
    });

    const data = (await res.json()) as { ok: boolean; error?: string; ts?: string };
    if (!data.ok) {
      return { success: false, error: `Slack API error: ${data.error}` };
    }
    return { success: true, externalId: data.ts };
  }

  return {
    success: false,
    error: "Slack: webhookUrl or (botToken + channel) credentials required",
  };
}
