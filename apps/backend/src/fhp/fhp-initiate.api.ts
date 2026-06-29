import { mustHave } from "schema/errors";
import { type FhpInitiateT, fhpInitiateZ, ftthProjectS } from "schema/fhp";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhpCheck } from "./utils";

export const fhpInitiateApi = postRoute({
  url: "/fhp/initiate",
  schema: fhpInitiateZ,
  handler: (req) => fhpInitiate(req.body),
});

async function fhpInitiate(dto: FhpInitiateT) {
  const { id: workId, vendorId } = dto;
  const { s, v } = await fhpCheck({
    workId,
    vendorId,
    status: WorkStatus.ASSIGNED,
  });
  mustHave(v || s.work.vendor, "vendorId");

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
