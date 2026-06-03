import { type FhpReportT, fhpReportZ, ftthProjectS } from "schema/fhp";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/db";
import { currentDate, postRoute } from "#/utils";
import { updateWork } from "../utils/work";
import { fhpCheck, fhpWorker } from "./utils";

export default postRoute(
  "/fhp/submit",
  () => fhpReportZ,
  (req) => fhpSubmit(req.body),
);

async function fhpSubmit(dto: FhpReportT) {
  const { id, comment, uploads, AS_BUILT_BOQ, AS_BUILT_KMZ, ...fields } = dto;
  const { s } = await fhpCheck({
    workId: id,
    status: [WorkStatus.ONGOING, WorkStatus.REVIEW_FAILED],
  });

  const report = {
    ...fields,
    submitDate: currentDate(),
  } satisfies Prisma.FhpReportUpdateInput;
  const resent = s.work.status !== WorkStatus.ONGOING;
  const action = resent ? WorkAction.RESEND_REPORT : WorkAction.SUBMIT_REPORT;

  return prisma.ftthProject.update({
    select: ftthProjectS,
    where: { id },
    data: {
      report: { upsert: { create: report, update: report } },
      work: updateWork({
        dto,
        old: s.work,
        action,
        status: WorkStatus.REVIEW,
        logTo: fhpWorker(s)?.name,
        docs: { AS_BUILT_BOQ, AS_BUILT_KMZ },
      }),
    },
  });
}
