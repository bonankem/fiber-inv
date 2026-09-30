import { ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { type WorkUpdateT, workUpdateZ } from "schema/work";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export const fhsDeclineApi = postRoute({
  url: "/fhs/decline",
  schema: workUpdateZ,
  handler: (req) => fhsDecline(req.body, req.authUser),
});

async function fhsDecline(dto: WorkUpdateT, from: UserT) {
  const { s } = await fhsCheck({
    workId: dto.id,
    status: WorkStatus.REQUESTED,
  });
  return prisma.ftthSurvey.update({
    where: { id: s.id },
    data: {
      work: updateWork({
        dto,
        work: s.work,
        action: WorkAction.DECLINE,
        status: WorkStatus.DECLINED,
        sender: from,
      }),
    },
    select: ftthSurveyS,
  });
}
