import dayjs from "dayjs";
import { prisma } from "#/db";
import { type AnyReply, getRoute } from "#/utils";
import { sendCsv } from "#/utils/csv";

export const authLogsAoi = getRoute("/admin/auth-logs", null, (_, __, res) =>
  getAuthLogs(res),
);

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
