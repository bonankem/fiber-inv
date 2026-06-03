import type { UserFullT } from "schema/people";
import { workLogS } from "schema/work";
import { prisma } from "#/prisma";
import { idRoute } from "#/utils";
import { workAccess } from "../work/filter";

export default idRoute("/fhs/:id/logs", (req) =>
  fhsLogs(req.params.id, req.authUser),
);

async function fhsLogs(id: string, user: UserFullT) {
  return prisma.workLog.findMany({
    where: { work: { fhs: { id }, AND: workAccess(user) } },
    orderBy: { createdAt: "desc" },
    select: workLogS,
  });
}
