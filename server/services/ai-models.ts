import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { encrypt } from "@/lib/encrypt";
import { maskApiKey } from "@/lib/api-key-mask";

const providerSelect = {
  id: true,
  workspaceId: true,
  name: true,
  slug: true,
  encryptedApiKey: true,
  maskedApiKey: true,
  enabled: true,
} as const;

type ProviderRow = {
  encryptedApiKey: string | null;
  maskedApiKey: string | null;
} & Record<string, unknown>;

function toPublicProvider(raw: ProviderRow) {
  const masked = raw.maskedApiKey ?? null;
  const { encryptedApiKey: _enc, ...rest } = raw;
  return { ...rest, apiKey: masked };
}

export const aiModelsService = new Elysia({ prefix: "/ai-models", aot: false })
  .get("/", async ({ params }) => {
    const rows = await prisma.aIProvider.findMany({
      where: { workspaceId: params.workspaceId },
      select: providerSelect,
    });
    return rows.map(toPublicProvider);
  })
  .post(
    "/",
    async ({ params, body }) => {
      const workspaceId = params.workspaceId;
      const existing = await prisma.aIProvider.findFirst({
        where: { workspaceId, slug: body.slug },
        select: providerSelect,
      });
      const providerId = existing?.id ?? `${workspaceId}-${body.slug}`;
      const rawKey = body.apiKey?.trim() || null;
      const encrypted = rawKey ? encrypt(rawKey) : null;
      const masked = rawKey ? maskApiKey(rawKey) : null;
      const p = await prisma.aIProvider.upsert({
        where: { id: providerId },
        update: {
          encryptedApiKey: rawKey !== null ? encrypted : (existing?.encryptedApiKey ?? null),
          maskedApiKey: rawKey !== null ? masked : (existing?.maskedApiKey ?? null),
          enabled: body.enabled ?? existing?.enabled ?? true,
        },
        create: {
          id: providerId,
          workspaceId,
          name: body.name,
          slug: body.slug,
          encryptedApiKey: encrypted ?? null,
          maskedApiKey: masked ?? null,
          enabled: body.enabled ?? true,
        },
        select: providerSelect,
      });
      return toPublicProvider(p);
    },
    {
      body: t.Object({
        id: t.Optional(t.String()),
        name: t.String(),
        slug: t.String(),
        apiKey: t.Optional(t.String()),
        enabled: t.Optional(t.Boolean()),
      }),
    },
  )
  .get("/:id", async ({ params }) => {
    const p = await prisma.aIProvider.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
      select: providerSelect,
    });
    if (!p) throw new Error("Provider not found");
    return toPublicProvider(p);
  })
  .put(
    "/:id",
    async ({ params, body }) => {
      const existing = await prisma.aIProvider.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
        select: providerSelect,
      });
      if (!existing) throw new Error("Provider not found");
      const rawKey = body.apiKey !== undefined ? body.apiKey?.trim() || null : undefined;
      const updateData: {
        enabled?: boolean;
        encryptedApiKey?: string | null;
        maskedApiKey?: string | null;
      } = {};
      if (body.enabled !== undefined) updateData.enabled = body.enabled;
      if (rawKey !== undefined) {
        updateData.encryptedApiKey = rawKey ? encrypt(rawKey) : null;
        updateData.maskedApiKey = rawKey ? maskApiKey(rawKey) : null;
      }
      if (Object.keys(updateData).length === 0) {
        return toPublicProvider(existing);
      }
      const p = await prisma.aIProvider.update({
        where: { id: params.id },
        data: updateData,
        select: providerSelect,
      });
      return toPublicProvider(p);
    },
    {
      body: t.Object({
        enabled: t.Optional(t.Boolean()),
        apiKey: t.Optional(t.String()),
      }),
    },
  );
