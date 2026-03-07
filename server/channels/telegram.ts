import { Telegraf, Telegram } from "telegraf";
import type { Update } from "telegraf/types";
import type { SendChannelMessageInput, ChannelSendResult } from "./types";

export interface TelegramIncomingMessage {
  chatId: string;
  text: string;
  from: {
    id: number;
    username?: string;
    firstName?: string;
  };
}

/**
 * Process a raw Telegram update via Telegraf.
 * Calls `onMessage` for every text message received.
 */
export async function handleTelegramUpdate(
  botToken: string,
  update: Update,
  onMessage: (msg: TelegramIncomingMessage) => Promise<void>,
): Promise<void> {
  const bot = new Telegraf(botToken);

  bot.on("message", async (ctx) => {
    const text = "text" in ctx.message ? (ctx.message.text ?? "") : "";
    await onMessage({
      chatId: String(ctx.chat.id),
      text,
      from: {
        id: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
      },
    });
  });

  await bot.handleUpdate(update);
}

/** Register a webhook URL with Telegram so updates are pushed to our endpoint. */
export async function registerTelegramWebhook(botToken: string, webhookUrl: string): Promise<void> {
  const telegram = new Telegram(botToken);
  await telegram.setWebhook(webhookUrl);
}

/** Remove the webhook registration (reverts to long-polling mode). */
export async function deleteTelegramWebhook(botToken: string): Promise<void> {
  const telegram = new Telegram(botToken);
  await telegram.deleteWebhook();
}

/** Parse allowed usernames and userId map from channel credentials */
export function parseTelegramCredentials(credentials: Record<string, string>) {
  const raw = credentials.allowedUsernames ?? "";
  let allowedUsernames: string[];
  if (raw.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(raw) as unknown[];
      allowedUsernames = Array.isArray(arr)
        ? arr.map((u) => String(u).trim().toLowerCase().replace(/^@/, "")).filter(Boolean)
        : [];
    } catch {
      allowedUsernames = [];
    }
  } else {
    allowedUsernames = raw
      .split(",")
      .map((u) => u.trim().toLowerCase().replace(/^@/, ""))
      .filter(Boolean);
  }
  let userIdMap: Record<string, string> = {};
  try {
    const raw = credentials.userIdMap;
    if (typeof raw === "string" && raw) userIdMap = JSON.parse(raw) as Record<string, string>;
  } catch {
    // ignore
  }
  return { allowedUsernames, userIdMap };
}

/**
 * Send a message to a Telegram chat via @JiraClawBot.
 * Uses TELEGRAM_BOT_TOKEN from env. Credentials: allowedUsernames, userIdMap (internal).
 */
export async function sendTelegramMessage(
  input: SendChannelMessageInput,
): Promise<ChannelSendResult> {
  const { credentials, message, recipient } = input;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return { success: false, error: "Telegram: TELEGRAM_BOT_TOKEN not configured" };
  }

  const { userIdMap } = parseTelegramCredentials(credentials);
  const userIds = Object.values(userIdMap);

  let targetChatId: string | undefined;
  if (recipient) {
    if (/^\d+$/.test(String(recipient))) targetChatId = String(recipient);
    else {
      const uname = String(recipient).replace(/^@/, "").toLowerCase();
      targetChatId = userIdMap[uname];
    }
  }
  if (!targetChatId && userIds.length > 0) targetChatId = userIds[0];

  if (!targetChatId) {
    return {
      success: false,
      error:
        "Telegram: No recipient. Add allowed usernames and have them message @JiraClawBot first.",
    };
  }

  const text = message.ticketKey ? `<b>[${message.ticketKey}]</b> ${message.text}` : message.text;

  try {
    const telegram = new Telegram(botToken);
    const sent = await telegram.sendMessage(targetChatId, text, {
      parse_mode: "HTML",
    });
    return { success: true, externalId: String(sent.message_id) };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Telegram error: ${error}` };
  }
}
