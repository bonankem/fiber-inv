import { type FhsAssignT, fhsAssignZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export default postRoute(
  "/fhs/assign",
  () => fhsAssignZ,
  (req) => fhsAssign(req.body, req.authUser),
);

async function fhsAssign(dto: FhsAssignT, from: UserT) {
  const { id: workId, userId, vendorId } = dto;
  const { s, u, v } = await fhsCheck({
    workId,
    userId,
    vendorId,
    status: WorkStatus.REQUESTED,
    statusError: "Survey is already assigned",
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
        from,
        logTo: [u, v],
      }),
    },
    select: ftthSurveyS,
  });
}
