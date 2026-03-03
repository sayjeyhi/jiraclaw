import { ALLOWED_AI_PROVIDERS } from "@/lib/constants/allowed-ai-providers";
import type { AIProvider, AIModel } from "@/lib/types";

type ProviderFromApi = Omit<AIProvider, "models"> & { models?: AIModel[] };

/** Merges API providers with template models (from ALLOWED_AI_PROVIDERS). */
export function mergeProvidersWithModels(providers: ProviderFromApi[]): AIProvider[] {
  return providers.map((p) => {
    const template = ALLOWED_AI_PROVIDERS.find((t) => t.slug === p.slug);
    return { ...p, models: template?.models ?? p.models ?? [] };
  });
}
