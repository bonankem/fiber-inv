import { WorkAction, WorkStatus } from "schema/enums";
import { mustHaveFields } from "schema/errors";
import { type FhsReviewT, fhsReviewZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { currentDate } from "#/utils/time";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

const S = WorkStatus;
const next = {
  [S.TALLYING_VALIDATION]: [S.PARTING, S.TALLYING_REJECTED],
  [S.PARTING_VALIDATION]: [S.SIZING, S.PARTING_REJECTED],
  [S.SIZING_VALIDATION]: [S.BOM, S.SIZING_REJECTED],
  [S.BOM_VALIDATION]: [S.CLOSED, S.BOM_REJECTED],
} as const;
type Reviewable = keyof typeof next;
const reviewable = Object.keys(next) as Reviewable[];

export const fhsReviewApi = postRoute({
  url: "/fhs/review",
  schema: fhsReviewZ,
  handler: (req) => fhsReview(req.body, req.authUser),
});

async function fhsReview(dto: FhsReviewT, from: UserT) {
  const { s } = await fhsCheck({
    workId: dto.id,
    status: reviewable,
  });
  const ok = dto.passed;
  if (!ok) mustHaveFields(dto, "comment");

  return prisma.ftthSurvey.update({
    select: ftthSurveyS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        work: s.work,
        sender: from,
        status: next[s.work.status as Reviewable][ok ? 0 : 1],
        action: ok ? WorkAction.VALIDATE : WorkAction.REJECT,
        also: { closeDate: ok ? currentDate() : undefined },
        logTo: s.work?.vendor,
      }),
    },
  });
}
