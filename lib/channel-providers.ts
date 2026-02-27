/**
 * Channel provider definitions: available channel types and their config schemas.
 * Each provider has a unique slug and credential fields that vary per type.
 */

export interface ChannelCredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  placeholder?: string;
  required?: boolean;
}

export interface ChannelProviderDef {
  slug: string;
  name: string;
  icon: string; // matches iconMap key in channel-card
  description?: string;
  credentials: ChannelCredentialField[];
}

export const CHANNEL_PROVIDERS: ChannelProviderDef[] = [
  {
    slug: "telegram",
    name: "Telegram",
    icon: "Send",
    description: "Send and receive messages via Telegram Bot API",
    credentials: [{ key: "botToken", label: "Bot Token", type: "password", required: true }],
  },
  {
    slug: "signal",
    name: "Signal",
    icon: "Shield",
    credentials: [
      { key: "phoneNumber", label: "Phone Number", type: "text", required: true },
      { key: "apiKey", label: "API Key", type: "password", required: true },
    ],
  },
  {
    slug: "slack",
    name: "Slack",
    icon: "Hash",
    description: "Integrate with Slack workspaces",
    credentials: [
      { key: "webhookUrl", label: "Webhook URL", type: "url", required: true },
      { key: "botToken", label: "Bot Token", type: "password", required: false },
    ],
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    icon: "MessageCircle",
    credentials: [
      { key: "phoneNumberId", label: "Phone Number ID", type: "text", required: true },
      { key: "accessToken", label: "Access Token", type: "password", required: true },
    ],
  },
  {
    slug: "imessage",
    name: "iMessage",
    icon: "Smartphone",
    credentials: [],
  },
  {
    slug: "email",
    name: "Email",
    icon: "Mail",
    description: "Send notifications via SMTP",
    credentials: [
      {
        key: "smtpHost",
        label: "SMTP Host",
        type: "text",
        placeholder: "smtp.gmail.com",
        required: true,
      },
      { key: "smtpPort", label: "SMTP Port", type: "text", placeholder: "587", required: true },
      { key: "smtpUser", label: "SMTP User", type: "text", required: false },
      { key: "smtpPassword", label: "SMTP Password", type: "password", required: false },
    ],
  },
  {
    slug: "webhook",
    name: "Webhook",
    icon: "Webhook",
    description: "Send events to custom HTTP endpoints",
    credentials: [
      {
        key: "url",
        label: "Webhook URL",
        type: "url",
        placeholder: "https://hooks.example.com/jiraclaw",
        required: true,
      },
    ],
  },
];

export function getChannelProvider(slug: string): ChannelProviderDef | undefined {
  return CHANNEL_PROVIDERS.find((p) => p.slug === slug);
}
