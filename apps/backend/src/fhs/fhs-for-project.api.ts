import { ftthSurveyBriefS } from "schema/fhs";
import type { UserFullT } from "schema/people";
import { prisma, WorkStatus } from "#/db";
import { getRoute } from "#/utils";
import { workAccess } from "../work/filter";

export default getRoute("/fhs/for-project", null, (req) =>
  fhsForProject(req.authUser),
);

async function fhsForProject(user: UserFullT) {
  return prisma.ftthSurvey.findMany({
    where: {
      work: {
        ...workAccess(user),
        status: WorkStatus.CLOSED,
      },
    },
    select: ftthSurveyBriefS,
    orderBy: [{ createdAt: "desc" }],
  });
}
