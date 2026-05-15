import { type FhsSubmitT, fhsSubmitZ } from "schema/fhs";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/prisma";
import { currentDate, maybeConnect, postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhsCheck, fhsWorker } from "./utils";

export default postRoute(
  "/fhs/submit",
  () => fhsSubmitZ,
  (req) => fhsSubmit(req.body),
);

async function fhsSubmit(dto: FhsSubmitT) {
  const {
    id,
    comment,
    uploads,
    PLAN_KMZ,
    PLAN_BOQ,
    PLAN_DIAGRAM,
    SYNOPTIC_TABLE,
    SYNOPTIC_DIAGRAM,
    existingOltId,
    ...fields
  } = dto;
  const { s } = await fhsCheck({
    workId: id,
    status: [WorkStatus.ONGOING, WorkStatus.REVIEW_FAILED],
  });

  const report = {
    ...fields,
    submitDate: currentDate(),
    existingOlt: maybeConnect(existingOltId),
  } satisfies Prisma.FhsReportUpdateInput;
  const resent = s.work.status !== WorkStatus.ONGOING;
  const action = resent ? WorkAction.RESEND_REPORT : WorkAction.SUBMIT_REPORT;

  return prisma.ftthSurvey.update({
    where: { id },
    data: {
      actualHp: report.hpImmeuble + report.hpPavillon,
      report: { upsert: { create: report, update: report } },
      work: updateWork({
        dto,
        old: s.work,
        action,
        status: WorkStatus.REVIEW,
        logTo: fhsWorker(s)?.name,
        docs: {
          PLAN_KMZ,
          PLAN_BOQ,
          PLAN_DIAGRAM,
          SYNOPTIC_TABLE,
          SYNOPTIC_DIAGRAM,
        },
      }),
    },
  });
}
