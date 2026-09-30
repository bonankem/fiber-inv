import { type FhsSubmitTallyT, fhsSubmitTallyZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhsCheck, fhsWorker } from "./utils";

export const fhsSubmitTallyApi = postRoute({
  url: "/fhs/tallying",
  schema: fhsSubmitTallyZ,
  handler: (req) => fhsSubmitTally(req.body, req.authUser),
});

async function fhsSubmitTally(dto: FhsSubmitTallyT, user: UserT) {
  const { id, hp, FHS_TALLY_KMZ, FHS_TALLY_TABLE } = dto;
  const { s } = await fhsCheck({
    workId: id,
    status: [WorkStatus.TALLYING, WorkStatus.TALLYING_REJECTED],
  });
  return prisma.ftthSurvey.update({
    where: { id },
    data: {
      hp,
      work: updateWork({
        dto,
        work: s.work,
        sender: user,
        action: WorkAction.SUBMIT_TALLYING,
        status: WorkStatus.TALLYING_VALIDATION,
        logTo: fhsWorker(s)?.name,
        docs: { FHS_TALLY_KMZ, FHS_TALLY_TABLE },
      }),
    },
    select: ftthSurveyS,
  });
}
