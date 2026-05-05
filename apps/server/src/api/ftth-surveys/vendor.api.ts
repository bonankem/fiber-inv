import { type FhsVendorT, fhsVendorZ, ftthSurveyS } from "schema/fhs";
import { prisma, WorkAction, WorkStatus } from "#/prisma";
import { connectId, notFound, postRoute } from "#/utils";
import { addLog } from "../utils/queries";

export default postRoute(
  "/fhs/vendor",
  () => fhsVendorZ,
  (req) => fhsAssignVendor(req.body),
);

async function fhsAssignVendor(req: FhsVendorT) {
  const { id: workId, vendorId } = req;

  const [s, v] = await Promise.all([
    prisma.ftthSurvey.findFirst({
      where: { id: workId },
      select: { id: true, work: { select: { status: true } } },
    }),
    prisma.vendor.findFirst({ where: { id: vendorId } }),
  ]);
  if (!s) notFound("Survey not found");
  if (vendorId && !v) notFound("Vendor not found");

  const firstTime = s.work.status === WorkStatus.ASSIGNED;
  const action = WorkAction.ASSIGN_VENDOR;
  const status = firstTime ? WorkStatus.ONGOING : undefined;

  await prisma.work.update({
    where: { id: workId },
    data: {
      status,
      vendor: connectId(vendorId),
      logs: addLog(req, action, status, [v]),
    },
  });

  return prisma.ftthSurvey.findUnique({
    where: { id: workId },
    select: ftthSurveyS,
  });
}
