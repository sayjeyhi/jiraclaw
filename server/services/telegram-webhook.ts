import { Elysia } from "elysia";
import { prisma } from "../db";
import { inngest } from "../inngest/client";
import { handleTelegramUpdate, parseTelegramCredentials } from "../channels/telegram";
import type { Update } from "telegraf/types";

/**
 * Public webhook endpoint for @JiraClawBot.
 * Single webhook for the app — routes messages to channels by allowed usernames.
 * URL: POST /api/telegram/webhook
 */
export const telegramWebhookService = new Elysia({ prefix: "/telegram" }).post(
  "/webhook",
  async ({ body }) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return { ok: true };

    const channels = await prisma.channelConfig.findMany({
      where: { slug: "telegram", enabled: true },
    });
    if (channels.length === 0) return { ok: true };

    await handleTelegramUpdate(botToken, body as Update, async (msg) => {
      const senderUsername = msg.from.username?.toLowerCase().replace(/^@/, "");
      if (!senderUsername) return; // User has no username set

      for (const channel of channels) {
        const creds = (channel.credentials ?? {}) as Record<string, string>;
        const { allowedUsernames } = parseTelegramCredentials(creds);
        if (!allowedUsernames.includes(senderUsername)) continue;

        // Update userIdMap for this user
        let userIdMap: Record<string, string> = {};
        try {
          const raw = creds.userIdMap;
          if (typeof raw === "string" && raw) userIdMap = JSON.parse(raw) as Record<string, string>;
        } catch {
          /* ignore */
        }
        userIdMap[senderUsername] = String(msg.from.id);
        const nextCreds = { ...creds, userIdMap: JSON.stringify(userIdMap) };

        await prisma.channelConfig.update({
          where: { id: channel.id },
          data: { credentials: nextCreds },
        });

        await inngest.send({
          name: "app/telegram.message.received",
          data: {
            channelId: channel.id,
            workspaceId: channel.workspaceId,
            chatId: msg.chatId,
            text: msg.text,
            from: msg.from,
          },
        });
      }
    });

    return { ok: true };
  },
);
