import { WorkAction } from "schema/enums";
import { bad, Err } from "schema/errors";
import { type FhcSurveyT, fhcSurveyZ, ftthConnectionS } from "schema/fhc";
import type { UserT } from "schema/people";
import { workFullP } from "schema/work";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";

export const fhcSurveyApi = postRoute({
  url: "/fhc/survey",
  schema: fhcSurveyZ,
  handler: (req) => fhcSurvey(req.body, req.authUser),
});

async function fhcSurvey(dto: FhcSurveyT, from: UserT) {
  const { id, SURVEY_REPORT } = dto;
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);

  return prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id },
    data: {
      withPole: dto.withPole,
      work: updateWork({
        dto,
        old: fhc.work,
        status: dto.nextPhase,
        action: WorkAction.FINISH_SURVEY,
        docs: { SURVEY_REPORT },
        from,
      }),
    },
  });
}
