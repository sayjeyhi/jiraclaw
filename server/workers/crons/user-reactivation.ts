import dayjs from "dayjs";
import { prisma } from "../../db";

const INTERVAL_MS = 60_000;

async function runUserReactivation(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      status: "SUSPENDED",
      passwordLockedAt: { not: null },
    },
    select: { id: true, passwordLockedAt: true, passwordRetryCount: true },
  });

  for (const user of users) {
    const lockExpiry = dayjs(user.passwordLockedAt).add(user.passwordRetryCount || 3, "hours");
    if (dayjs().isAfter(lockExpiry)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE", passwordLockedAt: null, passwordRetryCount: 0 },
      });
      console.log(`[user-reactivation] Reactivated user ${user.id}`);
    }
  }
}

export function startUserReactivationCron(): void {
  console.log("[user-reactivation] Cron started (interval: 60s)");

  void runUserReactivation();

  setInterval(() => {
    void runUserReactivation().catch((err) => {
      console.error("[user-reactivation] Error during run:", err);
    });
  }, INTERVAL_MS);
}
