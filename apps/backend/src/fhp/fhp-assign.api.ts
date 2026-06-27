import { type FhpAssignT, fhpAssignZ, ftthProjectS } from "schema/fhp";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhpCheck } from "./utils";

export const fhpAssignApi = postRoute({
  url: "/fhp/assign",
  schema: fhpAssignZ,
  handler: (req) => fhpAssign(req.body),
});

async function fhpAssign(dto: FhpAssignT) {
  const { id: workId, userId, vendorId } = dto;
  const { s, u, v } = await fhpCheck({
    workId,
    userId,
    vendorId,
    status: WorkStatus.REQUESTED,
    statusError: "Already assigned",
  });
  return prisma.ftthProject.update({
    select: ftthProjectS,
    where: { id: workId },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        action: WorkAction.ASSIGN,
        status: WorkStatus.ASSIGNED,
        vendor: vendorId,
        workers: [{ userId, role: StaffRole.PROJECT_ENGINEER }],
        logTo: [u, v],
      }),
    },
  });
}
