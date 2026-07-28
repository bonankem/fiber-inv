import { type FhpSubmitT, fhpSubmitZ, ftthProjectS } from "schema/fhp";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { currentDate } from "#/utils/time";
import { updateWork } from "../utils/work";
import { fhpCheck, fhpWorker } from "./utils";

export const fhpSubmitApi = postRoute({
  url: "/fhp/submit",
  schema: fhpSubmitZ,
  handler: (req) => fhpSubmit(req.body),
});

async function fhpSubmit(dto: FhpSubmitT) {
  const { id, comment, uploads, BOQ, ODN_KMZ, ...fields } = dto;
  const { s } = await fhpCheck({
    workId: id,
    status: [WorkStatus.INSTALLATION, WorkStatus.FAILED],
  });

  const report = {
    ...fields,
    submitDate: currentDate(),
  } satisfies Prisma.FhpReportUpdateInput;
  const resent = s.work.status !== WorkStatus.INSTALLATION;
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
        docs: { BOQ, ODN_KMZ },
      }),
    },
  });
}
