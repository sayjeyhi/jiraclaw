import type { SlackNotificationPayload } from "@/lib/rabbitmq";

export async function handleSlackNotification(payload: SlackNotificationPayload): Promise<void> {
  const { webhookUrl, notification } = payload;

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notification),
  });

  if (!res.ok) {
    throw new Error(`Slack webhook responded with ${res.status}: ${await res.text()}`);
  }
}
