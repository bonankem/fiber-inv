import { WorkAction, WorkStatus } from "schema/enums";
import { type FhsReviewT, fhsReviewZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma } from "#/db";
import { bad, currentDate, postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export const fhsReviewApi = postRoute(
  "/fhs/review",
  () => fhsReviewZ,
  (req) => fhsReview(req.body, req.authUser),
);

async function fhsReview(dto: FhsReviewT, from: UserT) {
  const { s } = await fhsCheck({
    workId: dto.id,
    status: WorkStatus.REVIEW,
    statusError: "Survey is not under review",
  });
  const ok = dto.passed;
  if (!ok && !dto.comment) {
    bad("Comment is required");
  }
  return prisma.ftthSurvey.update({
    select: ftthSurveyS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        status: ok ? WorkStatus.CLOSED : WorkStatus.REVIEW_FAILED,
        action: ok ? WorkAction.PASS_REVIEW : WorkAction.FAIL_REVIEW,
        also: { closeDate: ok ? currentDate() : undefined },
        logTo: s.work?.vendor,
        from,
      }),
    },
  });
}
