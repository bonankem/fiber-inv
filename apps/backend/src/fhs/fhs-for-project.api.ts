import type { UserFullT } from "schema/people";
import { workBriefS } from "schema/work";
import { prisma, WorkStatus } from "#/db";
import { getRoute } from "#/utils";
import { workAccess } from "../work/filter";

export default getRoute("/fhs/for-project", null, (req) =>
  fhsForProject(req.authUser),
);

async function fhsForProject(user: UserFullT) {
  return prisma.work.findMany({
    where: {
      status: WorkStatus.CLOSED,
      fhs: { isNot: null },
      AND: workAccess(user),
    },
    select: workBriefS,
    orderBy: [{ createdAt: "desc" }],
  });
}
