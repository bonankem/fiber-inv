import { workBriefS } from "schema/work";
import { prisma, WorkStatus } from "#/prisma";
import { getRoute } from "#/utils";

export default getRoute("/fhs/for-project", null, () => fhsForProject());

async function fhsForProject() {
  return prisma.work.findMany({
    where: {
      fhs: { isNot: null },
      status: WorkStatus.CLOSED,
    },
    select: workBriefS,
    orderBy: [{ createdAt: "desc" }],
  });
}
