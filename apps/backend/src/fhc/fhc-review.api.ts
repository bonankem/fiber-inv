import { WorkAction, WorkStatus } from "schema/enums";
import { bad, Err, mustHaveFields } from "schema/errors";
import { ftthConnectionS } from "schema/fhc";
import { type FhsReviewT, fhsReviewZ } from "schema/fhs";
import type { UserT } from "schema/people";
import { workFullP } from "schema/work";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";

export const fhcReviewApi = postRoute({
  url: "/fhc/review",
  schema: fhsReviewZ,
  handler: (req) => fhcReview(req.body, req.authUser),
});

async function fhcReview(dto: FhsReviewT, from: UserT) {
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);

  const ok = dto.passed;
  if (!ok) mustHaveFields(dto, "comment");

  return prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        work: fhc.work,
        status: ok ? WorkStatus.CONFIGURATION : WorkStatus.FAILED_REVIEW,
        action: ok ? WorkAction.PASS_REVIEW : WorkAction.FAIL_REVIEW,
        logTo: fhc.work?.vendor,
        sender: from,
      }),
    },
  });
}
