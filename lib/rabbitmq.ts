import amqp, { type Channel, type ChannelModel } from "amqplib";

export const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672";

export const QUEUE_NAMES = {
  PROJECT_CLONE_REPO: "project.clone_repo",
  CHANNEL_MESSAGE: "channel.message",
  SLACK_NOTIFICATION: "slack.notification",
  TELEGRAM_MESSAGE_RECEIVED: "telegram.message_received",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface ProjectCloneRepoPayload {
  projectId: string;
  workspaceId: string;
}

export interface ChannelMessagePayload {
  channelId: string;
  workspaceId: string;
  message: {
    text: string;
    botId?: string;
    ticketKey?: string;
    metadata?: Record<string, unknown>;
  };
  recipient?: string;
  ticketId?: string;
}

export interface SlackNotificationPayload {
  webhookUrl: string;
  notification: unknown;
}

export interface TelegramMessageReceivedPayload {
  channelId: string;
  workspaceId: string;
  chatId: number;
  text: string;
  from: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
}

export type QueuePayloadMap = {
  [QUEUE_NAMES.PROJECT_CLONE_REPO]: ProjectCloneRepoPayload;
  [QUEUE_NAMES.CHANNEL_MESSAGE]: ChannelMessagePayload;
  [QUEUE_NAMES.SLACK_NOTIFICATION]: SlackNotificationPayload;
  [QUEUE_NAMES.TELEGRAM_MESSAGE_RECEIVED]: TelegramMessageReceivedPayload;
};

let publisherConnection: ChannelModel | null = null;
let publisherChannel: Channel | null = null;

async function getPublisherChannel(): Promise<Channel> {
  if (publisherChannel) return publisherChannel;

  publisherConnection = await amqp.connect(RABBITMQ_URL);

  publisherConnection.on("close", () => {
    publisherConnection = null;
    publisherChannel = null;
  });
  publisherConnection.on("error", () => {
    publisherConnection = null;
    publisherChannel = null;
  });

  publisherChannel = await publisherConnection.createChannel();
  await Promise.all(
    Object.values(QUEUE_NAMES).map((q) => publisherChannel!.assertQueue(q, { durable: true })),
  );

  return publisherChannel;
}

export async function publishToQueue<Q extends QueueName>(
  queue: Q,
  payload: QueuePayloadMap[Q],
): Promise<void> {
  const channel = await getPublisherChannel();
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
}
