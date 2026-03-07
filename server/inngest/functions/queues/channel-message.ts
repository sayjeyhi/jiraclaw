import { inngest } from "../../client";
import { prisma } from "../../../db";
import { sendChannelMessage } from "../../../channels";
import { randomUUID } from "node:crypto";

interface ChannelMessageEventData {
  channelId: string;
  workspaceId: string;
  message: {
    text: string;
    botId?: string;
    ticketKey?: string;
    metadata?: Record<string, unknown>;
  };
  /** Channel-specific recipient: Telegram chatId, email address, WhatsApp phone number */
  recipient?: string;
  /** Optional BotTicket.id — attaches a ChannelMessage record to the ticket on success */
  ticketId?: string;
}

export const channelMessageSender = inngest.createFunction(
  { id: "channel-message-sender" },
  { event: "app/channel.message.send" },
  async ({ step, event }) => {
    const data = event.data as ChannelMessageEventData;

    const channel = await step.run("fetch-channel", async () => {
      const c = await prisma.channelConfig.findFirst({
        where: { id: data.channelId, workspaceId: data.workspaceId },
      });
      if (!c) throw new Error(`Channel not found: ${data.channelId}`);
      if (!c.enabled) throw new Error(`Channel is disabled: ${c.name}`);
      return c;
    });

    const result = await step.run("send-message", () =>
      sendChannelMessage({
        slug: channel.slug,
        credentials: channel.credentials as Record<string, string>,
        message: data.message,
        recipient: data.recipient,
      }),
    );

    await step.run("persist-result", async () => {
      // Write a log entry for observability
      await prisma.logEntry.create({
        data: {
          id: randomUUID(),
          workspaceId: data.workspaceId,
          service: "channels",
          level: result.success ? "info" : "error",
          message: result.success
            ? `Message delivered via ${channel.name}`
            : `Failed to deliver via ${channel.name}: ${result.error}`,
          timestamp: new Date(),
          botId: data.message.botId ?? null,
          metadata: {
            channelId: data.channelId,
            channelSlug: channel.slug,
            ticketKey: data.message.ticketKey,
            externalId: result.externalId,
            ...(result.error ? { error: result.error } : {}),
          },
        },
      });

      // Attach a ChannelMessage record to the BotTicket if provided
      if (data.ticketId) {
        const ticket = await prisma.botTicket.findFirst({
          where: { id: data.ticketId, workspaceId: data.workspaceId },
        });
        if (ticket) {
          const existing = (ticket.channelMessages as Record<string, unknown>[]) ?? [];
          await prisma.botTicket.update({
            where: { id: data.ticketId },
            data: {
              channelMessages: [
                ...existing,
                {
                  id: randomUUID(),
                  channel: channel.name,
                  message: data.message.text,
                  sentAt: new Date().toISOString(),
                  status: result.success ? "delivered" : "failed",
                },
              ],
            },
          });
        }
      }
    });

    return {
      success: result.success,
      channelId: data.channelId,
      channelSlug: channel.slug,
      externalId: result.externalId,
      error: result.error,
    };
  },
);
