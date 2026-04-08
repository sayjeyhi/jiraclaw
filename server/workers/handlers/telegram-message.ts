import type { TelegramMessageReceivedPayload } from "@/lib/rabbitmq";

export async function handleTelegramMessageReceived(
  payload: TelegramMessageReceivedPayload,
): Promise<void> {
  const { channelId, workspaceId, chatId, text, from } = payload;

  console.log(
    `[telegram-message] Received message from @${from.username ?? from.id} in workspace ${workspaceId} via channel ${channelId}:`,
    { chatId, text },
  );

  // TODO: implement bot response logic here
}
