import { type FhsInitiateT, fhsInitiateZ } from "schema/fhs";
import { prisma, WorkAction, WorkStatus } from "#/prisma";
import { bad, postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export default postRoute(
  "/fhs/initiate",
  () => fhsInitiateZ,
  (req) => fhsInitiate(req.body),
);

async function fhsInitiate(dto: FhsInitiateT) {
  const { id: workId, vendorId } = dto;

  const { s, v } = await fhsCheck({
    workId,
    vendorId,
    status: WorkStatus.ASSIGNED,
    statusError: "Job is already initiated",
  });
  const toVendor = v || s.work.vendor;
  if (!toVendor) bad("Vendor is required");

  return prisma.ftthSurvey.update({
    where: { id: workId },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        vendor: vendorId,
        action: WorkAction.INITIATE,
        status: WorkStatus.ONGOING,
        logTo: v,
      }),
    },
  });
}
