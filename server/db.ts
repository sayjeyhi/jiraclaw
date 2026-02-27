import { PrismaClient } from "@/lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForDb = globalThis as unknown as { __prisma?: PrismaClient };
export const prisma = globalForDb.__prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForDb.__prisma = prisma;
