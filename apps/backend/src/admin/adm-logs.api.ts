import dayjs from "dayjs";
import { prisma } from "#/db";
import { sendCsv } from "#/utils/csv";
import { type AnyReply, getRoute } from "#/utils/routing";

export const authLogsApi = getRoute({
  url: "/admin/auth-logs",
  handler: (_, __, res) => getAuthLogs(res),
});

async function getAuthLogs(res: AnyReply) {
  const since = dayjs().subtract(14, "days").toDate();
  const logs = await prisma.authLog.findMany({
    where: { time: { gte: since } },
    orderBy: { time: "desc" },
  });
  return sendCsv(res, logs, [
    { title: "action", value: (l) => l.action },
    { title: "time", value: (l) => l.time },
    { title: "userid", value: (l) => l.email },
    { title: "ip", value: (l) => l.ipAddress },
  ]);
}
