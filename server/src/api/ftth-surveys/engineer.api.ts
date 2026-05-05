import { type FhsEngineerT, fhsEngineerZ, ftthSurveyS } from "schema/fhs";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/prisma";
import { maybeConnect, notFound, postRoute } from "#/utils";
import { addLog } from "../utils/queries";

export default postRoute(
  "/fhs/engineer",
  () => fhsEngineerZ,
  (req) => fhsAssignEngineer(req.body),
);

async function fhsAssignEngineer(req: FhsEngineerT) {
  const { id: workId, userId, vendorId } = req;

  const [s, u, v] = await Promise.all([
    prisma.ftthSurvey.findFirst({
      where: { id: workId },
      select: { id: true, work: { select: { status: true } } },
    }),
    !!userId && prisma.user.findUnique({ where: { id: userId } }),
    !!vendorId && prisma.vendor.findUnique({ where: { id: vendorId } }),
  ]);
  if (!s) notFound("Survey not found");
  if (userId && !u) notFound("User not found");
  if (vendorId && !v) notFound("Vendor not found");

  const firstTime = s.work.status === WorkStatus.REQUESTED;
  const role = StaffRole.PLANNING_ENGINEER;
  const action = WorkAction.ASSIGN_ENGINEER;
  const status = firstTime
    ? vendorId
      ? WorkStatus.ONGOING
      : WorkStatus.ASSIGNED
    : undefined;

  await prisma.work.update({
    where: { id: workId },
    data: {
      status,
      workers: {
        upsert: {
          where: { uniq: { workId, role } },
          create: { userId, role },
          update: { userId },
        },
      },
      vendor: maybeConnect(vendorId),
      logs: addLog(req, action, status, [u, v]),
    },
  });

  return prisma.ftthSurvey.findUnique({
    where: { id: workId },
    select: ftthSurveyS,
  });
}
