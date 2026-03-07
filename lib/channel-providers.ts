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
  /** Short help text shown below the input */
  hint?: string;
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
    description: "Send and receive messages via @JiraClawBot on Telegram",
    credentials: [
      {
        key: "allowedUsernames",
        label: "Allowed usernames",
        type: "text",
        required: true,
        hint: "Add Telegram usernames (without @) and press Enter. Users must message @JiraClawBot first to be linked.",
      },
    ],
  },
  {
    slug: "slack",
    name: "Slack",
    icon: "Hash",
    description: "Integrate with Slack workspaces",
    credentials: [
      { key: "webhookUrl", label: "Webhook URL", type: "url", required: true },
      { key: "botToken", label: "Bot Token (optional)", type: "password", required: false },
      {
        key: "channel",
        label: "Channel ID (for Bot Token mode)",
        type: "text",
        placeholder: "C0123456789",
        required: false,
      },
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
