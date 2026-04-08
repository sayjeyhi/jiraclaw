import "dotenv/config";
import amqp, { type Channel, type ChannelModel } from "amqplib";
import { QUEUE_NAMES, RABBITMQ_URL } from "@/lib/rabbitmq";
import type {
  ChannelMessagePayload,
  ProjectCloneRepoPayload,
  SlackNotificationPayload,
  TelegramMessageReceivedPayload,
} from "@/lib/rabbitmq";
import { handleCloneRepo } from "./handlers/clone-repo";
import { handleChannelMessage } from "./handlers/channel-message";
import { handleSlackNotification } from "./handlers/slack-notification";
import { handleTelegramMessageReceived } from "./handlers/telegram-message";
import { startUserReactivationCron } from "./crons/user-reactivation";

const RECONNECT_MS = 3_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let shuttingDown = false;
const active: { connection?: ChannelModel; channel?: Channel } = {};

async function main() {
  process.on("SIGTERM", async () => {
    shuttingDown = true;
    console.log("[worker] SIGTERM received, shutting down gracefully...");
    try {
      if (active.channel) await active.channel.close();
      if (active.connection) await active.connection.close();
    } catch {
      /* already closed */
    }
    console.log("[worker] Disconnected from RabbitMQ. Exiting.");
    process.exit(0);
  });

  startUserReactivationCron();

  while (!shuttingDown) {
    console.log(
      "[worker] Connecting to RabbitMQ at",
      RABBITMQ_URL.replace(/\/\/.*@/, "//<credentials>@"),
    );

    let connection: ChannelModel;
    try {
      connection = await amqp.connect(RABBITMQ_URL);
    } catch (err) {
      console.error("[worker] Failed to connect to RabbitMQ:", err);
      await sleep(RECONNECT_MS);
      continue;
    }

    const connectionClosed = new Promise<void>((resolve) => {
      connection.once("close", () => resolve());
    });

    connection.on("error", (err) => {
      console.error("[worker] RabbitMQ connection error:", err);
    });

    console.log("[worker] Connected to RabbitMQ");

    try {
      const channel = await connection.createChannel();
      active.connection = connection;
      active.channel = channel;

      channel.on("error", (err) => {
        console.error("[worker] RabbitMQ channel error:", err);
      });

      await channel.assertQueue(QUEUE_NAMES.PROJECT_CLONE_REPO, { durable: true });
      await channel.assertQueue(QUEUE_NAMES.CHANNEL_MESSAGE, { durable: true });
      await channel.assertQueue(QUEUE_NAMES.SLACK_NOTIFICATION, { durable: true });
      await channel.assertQueue(QUEUE_NAMES.TELEGRAM_MESSAGE_RECEIVED, { durable: true });
      console.log("[worker] Queues asserted:", Object.values(QUEUE_NAMES).join(", "));

      void channel.prefetch(1);

      void channel.consume(QUEUE_NAMES.PROJECT_CLONE_REPO, async (msg) => {
        if (!msg) return;
        const raw = msg.content.toString();
        console.log("[worker] Picked message from %s: %s", QUEUE_NAMES.PROJECT_CLONE_REPO, raw);
        const start = Date.now();
        try {
          const payload = JSON.parse(raw) as ProjectCloneRepoPayload;
          await handleCloneRepo(payload);
          channel.ack(msg);
          console.log(
            "[worker] Acked message from %s (took %dms)",
            QUEUE_NAMES.PROJECT_CLONE_REPO,
            Date.now() - start,
          );
        } catch (err) {
          console.error("[worker] clone-repo error (took %dms):", Date.now() - start, err);
          channel.nack(msg, false, true);
          console.warn(
            "[worker] Nacked message from %s — will be requeued",
            QUEUE_NAMES.PROJECT_CLONE_REPO,
          );
        }
      });

      void channel.consume(QUEUE_NAMES.CHANNEL_MESSAGE, async (msg) => {
        if (!msg) return;
        const raw = msg.content.toString();
        console.log("[worker] Picked message from %s: %s", QUEUE_NAMES.CHANNEL_MESSAGE, raw);
        const start = Date.now();
        try {
          const payload = JSON.parse(raw) as ChannelMessagePayload;
          await handleChannelMessage(payload);
          channel.ack(msg);
          console.log(
            "[worker] Acked message from %s (took %dms)",
            QUEUE_NAMES.CHANNEL_MESSAGE,
            Date.now() - start,
          );
        } catch (err) {
          console.error("[worker] channel-message error (took %dms):", Date.now() - start, err);
          channel.nack(msg, false, true);
          console.warn(
            "[worker] Nacked message from %s — will be requeued",
            QUEUE_NAMES.CHANNEL_MESSAGE,
          );
        }
      });

      void channel.consume(QUEUE_NAMES.SLACK_NOTIFICATION, async (msg) => {
        if (!msg) return;
        const raw = msg.content.toString();
        console.log("[worker] Picked message from %s: %s", QUEUE_NAMES.SLACK_NOTIFICATION, raw);
        const start = Date.now();
        try {
          const payload = JSON.parse(raw) as SlackNotificationPayload;
          await handleSlackNotification(payload);
          channel.ack(msg);
          console.log(
            "[worker] Acked message from %s (took %dms)",
            QUEUE_NAMES.SLACK_NOTIFICATION,
            Date.now() - start,
          );
        } catch (err) {
          console.error("[worker] slack-notification error (took %dms):", Date.now() - start, err);
          channel.nack(msg, false, true);
          console.warn(
            "[worker] Nacked message from %s — will be requeued",
            QUEUE_NAMES.SLACK_NOTIFICATION,
          );
        }
      });

      void channel.consume(QUEUE_NAMES.TELEGRAM_MESSAGE_RECEIVED, async (msg) => {
        if (!msg) return;
        const raw = msg.content.toString();
        console.log(
          "[worker] Picked message from %s: %s",
          QUEUE_NAMES.TELEGRAM_MESSAGE_RECEIVED,
          raw,
        );
        const start = Date.now();
        try {
          const payload = JSON.parse(raw) as TelegramMessageReceivedPayload;
          await handleTelegramMessageReceived(payload);
          channel.ack(msg);
          console.log(
            "[worker] Acked message from %s (took %dms)",
            QUEUE_NAMES.TELEGRAM_MESSAGE_RECEIVED,
            Date.now() - start,
          );
        } catch (err) {
          console.error("[worker] telegram-message error (took %dms):", Date.now() - start, err);
          channel.nack(msg, false, true);
          console.warn(
            "[worker] Nacked message from %s — will be requeued",
            QUEUE_NAMES.TELEGRAM_MESSAGE_RECEIVED,
          );
        }
      });

      console.log("[worker] All consumers registered. Waiting for messages...");

      await connectionClosed;
    } catch (err) {
      console.error("[worker] RabbitMQ setup or consumer loop error:", err);
      try {
        await connection.close();
      } catch {
        /* ignore */
      }
    } finally {
      delete active.channel;
      delete active.connection;
    }

    if (shuttingDown) break;
    console.log(`[worker] Connection ended; reconnecting in ${RECONNECT_MS / 1000}s...`);
    await sleep(RECONNECT_MS);
  }
}

main().catch((err) => {
  console.error("[worker] Fatal:", err);
  process.exit(1);
});
