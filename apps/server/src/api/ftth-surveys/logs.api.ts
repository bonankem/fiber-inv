import { workLogS } from "schema/work";
import { prisma } from "#/prisma";
import { idRoute } from "#/utils";

export default idRoute("/fhs/:id/logs", (req) => fhsLogs(req.params.id));

async function fhsLogs(id: string) {
  return prisma.workLog.findMany({
    where: { work: { fhs: { id } } },
    select: workLogS,
    orderBy: { createdAt: "asc" },
  });
}
