import { ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { type WorkUpdateT, workUpdateZ } from "schema/work";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export default postRoute(
  "/fhs/decline",
  () => workUpdateZ,
  (req) => fhsDecline(req.body, req.authUser),
);

async function fhsDecline(dto: WorkUpdateT, from: UserT) {
  const { s } = await fhsCheck({
    workId: dto.id,
    status: WorkStatus.REQUESTED,
    statusError: "Survey is already assigned",
  });
  return prisma.ftthSurvey.update({
    where: { id: s.id },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        action: WorkAction.DECLINE,
        status: WorkStatus.DECLINED,
        from,
      }),
    },
    select: ftthSurveyS,
  });
}
