import { WorkStatus } from "schema/enums";
import { emrfJobS } from "schema/inventory";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { workAccess } from "../work/filter";

/** Materials are requested once a project is assigned, until it's built. */
export const emrfProjectStatuses: WorkStatus[] = [
  WorkStatus.ASSIGNED,
  WorkStatus.INSTALLATION,
];

// HP Delivery projects the user may request materials for
export const emrfJobsApi = getRoute({
  url: "/inventory/emrf/jobs",
  handler: (req) => emrfJobs(req.authUser),
});

async function emrfJobs(user: UserFullT) {
  return prisma.ftthProject.findMany({
    where: {
      work: {
        AND: [workAccess(user) ?? {}, { status: { in: emrfProjectStatuses } }],
      },
    },
    select: emrfJobS,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}
