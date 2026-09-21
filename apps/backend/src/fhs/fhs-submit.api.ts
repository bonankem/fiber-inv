import { type FhsSubmitT, fhsSubmitZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { currentDate } from "#/utils/time";
import { updateWork } from "../utils/work";
import { fhsCheck, fhsWorker } from "./utils";

export const fhsSubmitApi = postRoute({
  url: "/fhs/submit",
  schema: fhsSubmitZ,
  handler: (req) => fhsSubmit(req.body, req.authUser),
});

async function fhsSubmit(dto: FhsSubmitT, from: UserT) {
  const {
    id,
    comment,
    uploads,
    ODN_KMZ,
    // BOQ,
    PLAN_DIAGRAM,
    SYNOPTIC_TABLE,
    SYNOPTIC_DIAGRAM,
    COORDINATES,
    // CABLE_LENGTHS,
    HP_SUMMARY,
    ...fields
  } = dto;
  const { s } = await fhsCheck({
    workId: id,
    status: [WorkStatus.SURVEY, WorkStatus.FAILED_REVIEW],
  });

  const report = {
    ...fields,
    submitDate: currentDate(),
  } satisfies Prisma.FhsReportUpdateInput;
  const resent = s.work.status !== WorkStatus.SURVEY;
  const action = resent ? WorkAction.RESEND_REPORT : WorkAction.SUBMIT_REPORT;
  // const boxes = await getReportedBoxes(COORDINATES);

  return prisma.ftthSurvey.update({
    select: ftthSurveyS,
    where: { id },
    data: {
      reportedHp: report.hp,
      report: {
        upsert: {
          create: report,
          update: report,
        },
      },
      work: updateWork({
        dto,
        old: s.work,
        from,
        action,
        status: WorkStatus.REVIEW,
        logTo: fhsWorker(s)?.name,
        docs: {
          ODN_KMZ,
          // BOQ,
          PLAN_DIAGRAM,
          SYNOPTIC_TABLE,
          SYNOPTIC_DIAGRAM,
          COORDINATES,
          // CABLE_LENGTHS,
          HP_SUMMARY,
        },
      }),
    },
  });
}
