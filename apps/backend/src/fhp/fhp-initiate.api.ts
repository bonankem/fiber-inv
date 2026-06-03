import { type FhpInitiateT, fhpInitiateZ, ftthProjectS } from "schema/fhp";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { bad, postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhpCheck } from "./utils";

export default postRoute(
  "/fhp/initiate",
  () => fhpInitiateZ,
  (req) => fhpInitiate(req.body),
);

async function fhpInitiate(dto: FhpInitiateT) {
  const { id: workId, vendorId } = dto;

  const { s, v } = await fhpCheck({
    workId,
    vendorId,
    status: WorkStatus.ASSIGNED,
    statusError: "Job is already initiated",
  });
  const toVendor = v || s.work.vendor;
  console.log({ v: v?.name, v2: s.work?.vendor?.name, vid: vendorId });
  if (!toVendor) bad("Vendor is required");

  return prisma.ftthProject.update({
    select: ftthProjectS,
    where: { id: workId },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        vendor: vendorId,
        action: WorkAction.INITIATE,
        status: WorkStatus.ONGOING,
        logTo: v,
        also: {
          startDate: dto.startDate,
          dueDate: dto.dueDate,
        },
      }),
    },
  });
}
