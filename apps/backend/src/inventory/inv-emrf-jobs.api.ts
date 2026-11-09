import { WorkStatus } from "schema/enums";
import { emrfJobS } from "schema/inventory";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { workAccess } from "../work/filter";

// Closed HP Planning jobs the user may request materials for
// (createEmrf only accepts a closed survey)
export const emrfJobsApi = getRoute({
  url: "/inventory/emrf/jobs",
  handler: (req) => emrfJobs(req.authUser),
});

async function emrfJobs(user: UserFullT) {
  return prisma.ftthSurvey.findMany({
    where: {
      work: {
        AND: [workAccess(user) ?? {}, { status: WorkStatus.CLOSED }],
      },
    },
    select: emrfJobS,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}
