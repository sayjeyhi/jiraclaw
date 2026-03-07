export interface ChannelMessage {
  text: string;
  botId?: string;
  ticketKey?: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelSendResult {
  success: boolean;
  error?: string;
  externalId?: string;
}

export type ChannelCredentials = Record<string, string>;

export interface SendChannelMessageInput {
  slug: string;
  credentials: ChannelCredentials;
  message: ChannelMessage;
  /** Channel-specific recipient override: Telegram chatId, email address, WhatsApp phone number */
  recipient?: string;
}
