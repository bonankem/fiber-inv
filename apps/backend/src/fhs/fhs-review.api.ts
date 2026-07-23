import { WorkAction, WorkStatus } from "schema/enums";
import { mustHaveFields } from "schema/errors";
import { type FhsReviewT, fhsReviewZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { currentDate } from "#/utils/time";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export const fhsReviewApi = postRoute({
  url: "/fhs/review",
  schema: fhsReviewZ,
  handler: (req) => fhsReview(req.body, req.authUser),
});

async function fhsReview(dto: FhsReviewT, from: UserT) {
  const { s } = await fhsCheck({
    workId: dto.id,
    status: WorkStatus.REVIEW,
  });
  const ok = dto.passed;
  if (!ok) mustHaveFields(dto, "comment");

  return prisma.ftthSurvey.update({
    select: ftthSurveyS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        status: ok ? WorkStatus.CLOSED : WorkStatus.FAILED,
        action: ok ? WorkAction.PASS_REVIEW : WorkAction.FAIL_REVIEW,
        also: { closeDate: ok ? currentDate() : undefined },
        logTo: s.work?.vendor,
        from,
      }),
    },
  });
}
