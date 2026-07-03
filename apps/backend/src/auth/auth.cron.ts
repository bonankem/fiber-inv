import dayjs from "dayjs";
import { listAndMore } from "schema/utils";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, prisma } from "#/db";
import { type AppLog, appPlugin } from "#/utils/routing";

export const authCron = appPlugin((app) => {
  const expireUsersJob = new SimpleIntervalJob(
    { minutes: 30 },
    new AsyncTask(
      "expireUsers",
      () => expireUsers(app.log),
      (e) => app.log.error(e.message),
    ),
  );
  app.scheduler.addSimpleIntervalJob(expireUsersJob);
});

function daysAgo(now: dayjs.Dayjs, n: number) {
  return now.subtract(Math.max(1, n), "days").toDate();
}

async function expireUsers(log: AppLog) {
  const conf = await prisma.security.findFirst();
  if (!conf) return null;

  const now = dayjs();
  const adminLimit = daysAgo(now, conf.adminInactiveDays);
  const userLimit = daysAgo(now, conf.userInactiveDays);
  const newLimit = daysAgo(now, conf.newInactiveDays);

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { isAdmin: false, lastActive: { lt: userLimit } },
        { isAdmin: true, lastActive: { lt: adminLimit } },
        { joined: false, lastActive: { lt: newLimit } },
      ],
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (users.length) {
    const ids = users.map((u) => u.id);
    await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { expiredAt: now.toDate() },
    });

    const emails = users.map((u) => u.email);
    log.info(`Expired ${users.length} users: ${listAndMore(emails, 3)}`);
    const logs = users.map((u) => authLog(AuthAction.EXPIRED, null, u.email));
    await Promise.all(logs);
  }
}
