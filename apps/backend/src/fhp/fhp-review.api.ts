import { WorkAction, WorkStatus } from "schema/enums";
import { type FhpReviewT, fhpReviewZ, ftthProjectS } from "schema/fhp";
import { prisma } from "#/db";
import { bad } from "#/utils/errors";
import { postRoute } from "#/utils/routing";
import { currentDate } from "#/utils/time";
import { updateWork } from "../utils/work";
import { fhpCheck } from "./utils";

export const fhpReviewApi = postRoute({
  url: "/fhp/review",
  schema: fhpReviewZ,
  handler: (req) => fhpReview(req.body),
});

async function fhpReview(dto: FhpReviewT) {
  const { s } = await fhpCheck({
    workId: dto.id,
    status: WorkStatus.REVIEW,
    statusError: "Job is not under review",
  });
  const ok = dto.passed;
  if (!ok && !dto.comment) {
    bad("Comment is required");
  }
  return prisma.ftthProject.update({
    select: ftthProjectS,
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
