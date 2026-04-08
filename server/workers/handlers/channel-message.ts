import { randomUUID } from "node:crypto";
import { prisma } from "../../db";
import { sendChannelMessage } from "../../channels";
import type { ChannelMessagePayload } from "@/lib/rabbitmq";

export async function handleChannelMessage(payload: ChannelMessagePayload): Promise<void> {
  const { channelId, workspaceId, message, recipient, ticketId } = payload;

  const channel = await prisma.channelConfig.findFirst({
    where: { id: channelId, workspaceId },
  });
  if (!channel) throw new Error(`Channel not found: ${channelId}`);
  if (!channel.enabled) throw new Error(`Channel is disabled: ${channel.name}`);

  const result = await sendChannelMessage({
    slug: channel.slug,
    credentials: channel.credentials as Record<string, string>,
    message,
    recipient,
  });

  await prisma.logEntry.create({
    data: {
      id: randomUUID(),
      workspaceId,
      service: "channels",
      level: result.success ? "info" : "error",
      message: result.success
        ? `Message delivered via ${channel.name}`
        : `Failed to deliver via ${channel.name}: ${result.error}`,
      timestamp: new Date(),
      botId: message.botId ?? null,
      metadata: {
        channelId,
        channelSlug: channel.slug,
        ticketKey: message.ticketKey,
        externalId: result.externalId,
        ...(result.error ? { error: result.error } : {}),
      },
    },
  });

  if (ticketId) {
    const ticket = await prisma.botTicket.findFirst({
      where: { id: ticketId, workspaceId },
    });
    if (ticket) {
      const existing = (ticket.channelMessages as Record<string, unknown>[]) ?? [];
      await prisma.botTicket.update({
        where: { id: ticketId },
        data: {
          channelMessages: [
            ...existing,
            {
              id: randomUUID(),
              channel: channel.name,
              message: message.text,
              sentAt: new Date().toISOString(),
              status: result.success ? "delivered" : "failed",
            },
          ],
        },
      });
    }
  }
}
