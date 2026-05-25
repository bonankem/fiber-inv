import { type FhsAssignT, fhsAssignZ, ftthSurveyS } from "schema/fhs";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/prisma";
import { postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export default postRoute(
  "/fhs/assign",
  () => fhsAssignZ,
  (req) => fhsAssign(req.body),
);

async function fhsAssign(dto: FhsAssignT) {
  const { id: workId, userId, vendorId } = dto;
  const { s, u, v } = await fhsCheck({
    workId,
    userId,
    vendorId,
    status: WorkStatus.REQUESTED,
    statusError: "Status is already assigned",
  });
  return prisma.ftthSurvey.update({
    where: { id: workId },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        action: WorkAction.ASSIGN,
        status: WorkStatus.ASSIGNED,
        vendor: vendorId,
        workers: [{ userId, role: StaffRole.PLANNING_ENGINEER }],
        logTo: [u, v],
      }),
    },
    select: ftthSurveyS,
  });
}
