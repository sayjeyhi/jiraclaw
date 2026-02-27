import type { AIProvider } from "@/lib/types";

export const ALLOWED_AI_PROVIDERS: Omit<AIProvider, "workspaceId">[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    slug: "openrouter",
    apiKey: "sk-or-****",
    enabled: true,
    models: [
      { id: "openrouter/auto", name: "Auto", maxTokens: 128000 },
      { id: "openrouter/google/gemini-pro", name: "Gemini Pro", maxTokens: 32000 },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    slug: "anthropic",
    apiKey: "sk-ant-****",
    enabled: true,
    models: [
      { id: "claude-sonnet-4", name: "Claude Sonnet 4", maxTokens: 200000 },
      { id: "claude-haiku-3.5", name: "Claude Haiku 3.5", maxTokens: 200000 },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    slug: "openai",
    apiKey: "sk-****",
    enabled: true,
    models: [
      { id: "gpt-4o", name: "GPT-4o", maxTokens: 128000 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", maxTokens: 128000 },
      { id: "o1", name: "o1", maxTokens: 200000 },
    ],
  },
  {
    id: "ollama",
    name: "Ollama",
    slug: "ollama",
    enabled: true,
    models: [
      { id: "llama3.2", name: "Llama 3.2", maxTokens: 8192 },
      { id: "mistral", name: "Mistral 7B", maxTokens: 8192 },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    slug: "groq",
    enabled: true,
    models: [{ id: "llama-3.3-70b", name: "Llama 3.3 70B", maxTokens: 128000 }],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    slug: "deepseek",
    enabled: true,
    models: [{ id: "deepseek-chat", name: "DeepSeek Chat", maxTokens: 64000 }],
  },
];
