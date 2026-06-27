import dayjs from "dayjs";
import { prisma } from "#/db";
import { sendCsv } from "#/utils/csv";
import { type AnyReply, getRoute } from "#/utils/routing";

export const authLogsAoi = getRoute({
  url: "/admin/auth-logs",
  handler: (_, __, res) => getAuthLogs(res),
});

async function getAuthLogs(res: AnyReply) {
  const since = dayjs().subtract(24, "hours").toDate();
  const logs = await prisma.authLog.findMany({
    where: { time: { gte: since } },
    orderBy: { time: "desc" },
  });
  return sendCsv(res, logs, {
    action: (l) => l.action,
    time: (l) => l.time,
    userid: (l) => l.email,
    ip: (l) => l.ipAddress,
  });
}
