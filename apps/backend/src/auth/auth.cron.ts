import dayjs from "dayjs";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { prisma } from "#/db";
import { type AppLog, appPlugin } from "#/utils";
import { ACCOUNT_EXPIRY_HOURS } from "./config";

export const authCron = appPlugin(async (app) => {
  const expireUsersJob = new SimpleIntervalJob(
    { seconds: 30 },
    new AsyncTask(
      "expireUsers",
      () => expireUsers(app.log),
      (e) => app.log.error(e.message),
    ),
  );
  app.scheduler.addSimpleIntervalJob(expireUsersJob);
});

async function expireUsers(log: AppLog) {
  const limit = dayjs().subtract(ACCOUNT_EXPIRY_HOURS, "hours").toDate();
  const users = await prisma.user.findMany({
    where: { lastActive: { lt: limit } },
    select: { name: true },
  });
  log.info(`${users.length} expired: ${users.map((u) => u.name).join(",")}`);
}
