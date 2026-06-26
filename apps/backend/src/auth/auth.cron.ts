import dayjs from "dayjs";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { authLog } from "#/admin/syslog.api";
import { AuthAction, prisma } from "#/db";
import { type AppLog, appPlugin } from "#/utils";
import { ACCOUNT_EXPIRY_HOURS } from "./config";

export const authCron = appPlugin(async (app) => {
  const expireUsersJob = new SimpleIntervalJob(
    { minutes: 1 },
    new AsyncTask(
      "expireUsers",
      () => expireUsers(app.log),
      (e) => app.log.error(e.message),
    ),
  );
  app.scheduler.addSimpleIntervalJob(expireUsersJob);
});

async function expireUsers(log: AppLog) {
  const now = dayjs();
  const limit = now.subtract(ACCOUNT_EXPIRY_HOURS, "hours").toDate();

  const close = await prisma.user.findFirst({
    where: { lastActive: { gte: limit }, expiredAt: null },
    orderBy: { lastActive: "asc" },
  });
  if (close) {
    const hours = now.diff(close.lastActive, "hours");
    log.info(`Closest to expiry: ${close.name}, active ${hours}h ago`);
  }

  const past = await prisma.user.findMany({
    where: { lastActive: { lt: limit }, expiredAt: null },
    take: 5,
  });
  const ids = past.map((u) => u.id);
  await prisma.user.updateMany({
    where: { id: { in: ids } },
    data: { expiredAt: now.toDate() },
  });

  if (past.length) {
    log.info(`Expired ${past.length} users: ${past.map((u) => u.name).join()}`);
    const logs = past.map((u) => authLog(AuthAction.EXPIRED, null, u.email));
    await Promise.all(logs);
  }
}
