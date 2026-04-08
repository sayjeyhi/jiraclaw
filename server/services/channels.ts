import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { publishToQueue, QUEUE_NAMES } from "@/lib/rabbitmq";
import { sendChannelMessage } from "../channels";
import { registerTelegramWebhook, deleteTelegramWebhook } from "../channels/telegram";
import { Telegram } from "telegraf";
import { randomUUID } from "node:crypto";

export const channelsService = new Elysia({ prefix: "/channels", aot: false })
  .get("/", async ({ params }) =>
    prisma.channelConfig.findMany({ where: { workspaceId: params.workspaceId } }),
  )
  .post(
    "/",
    async ({ params, body }) => {
      const existing = await prisma.channelConfig.findFirst({
        where: {
          workspaceId: params.workspaceId,
          slug: body.slug,
        },
      });
      if (existing) throw new Error("Channel already exists for this workspace");
      const c = await prisma.channelConfig.create({
        data: {
          id: randomUUID(),
          workspaceId: params.workspaceId,
          name: body.name,
          slug: body.slug,
          icon: body.icon,
          enabled: true,
          credentials: (body.credentials as object) ?? {},
          botOverrides: {},
        },
      });
      return c;
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        icon: t.String(),
        credentials: t.Optional(t.Record(t.String(), t.String())),
      }),
    },
  )
  .post("/:id/webhook/setup", async ({ params, request }) => {
    const channel = await prisma.channelConfig.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId, slug: "telegram" },
    });
    if (!channel) throw new Error("Telegram channel not found");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN not configured");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const webhookUrl = `${appUrl}/api/telegram/webhook`;

    await registerTelegramWebhook(botToken, webhookUrl);
    return { ok: true, webhookUrl };
  })
  .post("/:id/webhook/teardown", async ({ params }) => {
    const channel = await prisma.channelConfig.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId, slug: "telegram" },
    });
    if (!channel) throw new Error("Telegram channel not found");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN not configured");

    const otherCount = await prisma.channelConfig.count({
      where: {
        slug: "telegram",
        enabled: true,
        id: { not: params.id },
      },
    });
    if (otherCount === 0) {
      await deleteTelegramWebhook(botToken);
    }
    return { ok: true };
  })
  .get("/:id", async ({ params }) => {
    const c = await prisma.channelConfig.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!c) throw new Error("Channel not found");
    return c;
  })
  .post(
    "/:id/send",
    async ({ params, body }) => {
      const channel = await prisma.channelConfig.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!channel) throw new Error("Channel not found");
      if (!channel.enabled) throw new Error("Channel is disabled");

      await publishToQueue(QUEUE_NAMES.CHANNEL_MESSAGE, {
        channelId: channel.id,
        workspaceId: params.workspaceId,
        message: body.message,
        recipient: body.recipient,
        ticketId: body.ticketId,
      });
      return { queued: true, channelId: channel.id };
    },
    {
      body: t.Object({
        message: t.Object({
          text: t.String(),
          botId: t.Optional(t.String()),
          ticketKey: t.Optional(t.String()),
          metadata: t.Optional(t.Record(t.String(), t.Unknown())),
        }),
        recipient: t.Optional(t.String()),
        ticketId: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/:id/test",
    async ({ params, body }) => {
      const channel = await prisma.channelConfig.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!channel) throw new Error("Channel not found");
      if (!channel.enabled) throw new Error("Channel is disabled — enable it before testing");

      const result = await sendChannelMessage({
        slug: channel.slug,
        credentials: channel.credentials as Record<string, string>,
        message: {
          text:
            body?.message ??
            `[JiraClaw] Test message — ${channel.name} is connected and working correctly.`,
        },
        recipient: body?.recipient,
      });

      return result;
    },
    {
      body: t.Optional(
        t.Object({
          recipient: t.Optional(t.String()),
          message: t.Optional(t.String()),
        }),
      ),
    },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const existing = await prisma.channelConfig.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Channel not found");
      const c = await prisma.channelConfig.update({
        where: { id: params.id },
        data: {
          ...body,
          credentials: body.credentials as object | undefined,
          botOverrides: body.botOverrides as object | undefined,
        },
      });
      return c;
    },
    {
      body: t.Object({
        enabled: t.Optional(t.Boolean()),
        credentials: t.Optional(t.Record(t.String(), t.String())),
        botOverrides: t.Optional(
          t.Record(
            t.String(),
            t.Object({
              enabled: t.Boolean(),
              credentials: t.Record(t.String(), t.String()),
            }),
          ),
        ),
      }),
    },
  );
