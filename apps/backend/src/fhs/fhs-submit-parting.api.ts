import {
  type FhsSubmitPartingT,
  fhsSubmitPartingZ,
  ftthSurveyS,
} from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhsCheck, fhsWorker } from "./utils";

export const fhsSubmitPartingApi = postRoute({
  url: "/fhs/parting",
  schema: fhsSubmitPartingZ,
  handler: (req) => fhsSubmitParting(req.body, req.authUser),
});

async function fhsSubmitParting(dto: FhsSubmitPartingT, user: UserT) {
  const { id, clusters, FHS_PARTING_KMZ } = dto;
  const { s } = await fhsCheck({
    workId: id,
    status: [WorkStatus.PARTING, WorkStatus.PARTING_REJECTED],
  });
  return prisma.ftthSurvey.update({
    where: { id },
    data: {
      clusters,
      work: updateWork({
        dto,
        work: s.work,
        sender: user,
        action: WorkAction.SUBMIT_PARTING,
        status: WorkStatus.PARTING_VALIDATION,
        docs: { FHS_PARTING_KMZ },
        logTo: fhsWorker(s)?.name,
      }),
    },
    select: ftthSurveyS,
  });
}
