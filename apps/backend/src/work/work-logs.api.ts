import { workLogS } from "schema/work";
import { prisma } from "#/db";
import { idRoute } from "#/utils/routing";

export default idRoute("/work/:id/logs", (req) => workLogs(req.params.id));

async function workLogs(id: string) {
  return prisma.workLog.findMany({
    where: { workId: id },
    orderBy: { createdAt: "asc" },
    select: workLogS,
  });
}
