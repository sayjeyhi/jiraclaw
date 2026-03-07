import { sendSlackMessage } from "./slack";
import { sendTelegramMessage } from "./telegram";
import { sendWhatsAppMessage } from "./whatsapp";
import { sendEmailMessage } from "./email";
import { sendWebhookMessage } from "./webhook";

export type { ChannelMessage, ChannelSendResult, SendChannelMessageInput } from "./types";

export async function sendChannelMessage(
  input: import("./types").SendChannelMessageInput,
): Promise<import("./types").ChannelSendResult> {
  switch (input.slug) {
    case "slack":
      return sendSlackMessage(input);
    case "telegram":
      return sendTelegramMessage(input);
    case "whatsapp":
      return sendWhatsAppMessage(input);
    case "email":
      return sendEmailMessage(input);
    case "webhook":
      return sendWebhookMessage(input);
    default:
      return { success: false, error: `Unknown channel slug: ${input.slug}` };
  }
}
