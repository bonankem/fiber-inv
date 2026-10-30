import dayjs from "dayjs";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, prisma } from "#/db";
import { appPlugin } from "#/utils/routing";

export const authCron = appPlugin((app) => {
  const expireUsersJob = new SimpleIntervalJob(
    { minutes: 30 },
    new AsyncTask(
      "expireUsers",
      () => expireUsers(),
      (e) => app.log.error(e.message),
    ),
  );
  app.scheduler.addSimpleIntervalJob(expireUsersJob);
});

function daysAgo(now: dayjs.Dayjs, n: number) {
  return now.subtract(Math.max(1, n), "days").toDate();
}

async function expireUsers() {
  const conf = await prisma.security.findFirst();
  if (!conf) return null;

  const now = dayjs();
  const adminLimit = daysAgo(now, conf.adminInactiveDays);
  const userLimit = daysAgo(now, conf.userInactiveDays);
  const newLimit = daysAgo(now, conf.newInactiveDays);

  const users = await prisma.user.findMany({
    where: {
      expiredAt: null,
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

    const logs = users.map((u) => authLog(AuthAction.EXPIRED, null, u.email));
    await Promise.all(logs);
  }
}
