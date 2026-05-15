import { WorkAction, WorkStatus } from "schema/enums";
import { type FhsReviewT, fhsReviewZ } from "schema/fhs";
import { prisma } from "#/prisma";
import { bad, currentDate, postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export default postRoute(
  "/fhs/review",
  () => fhsReviewZ,
  (req) => fhsReview(req.body),
);

async function fhsReview(dto: FhsReviewT) {
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
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        status: ok ? WorkStatus.CLOSED : WorkStatus.REVIEW_FAILED,
        action: ok ? WorkAction.PASS_REVIEW : WorkAction.FAIL_REVIEW,
        also: { closeDate: ok ? currentDate() : undefined },
        logTo: s.work?.vendor,
      }),
    },
  });
}
