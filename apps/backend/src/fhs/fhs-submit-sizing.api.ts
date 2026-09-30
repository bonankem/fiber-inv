import {
  type FhsSubmitSizingT,
  fhsSubmitSizingZ,
  ftthSurveyS,
} from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhsCheck, fhsWorker } from "./utils";

export const fhsSubmitSizingApi = postRoute({
  url: "/fhs/sizing",
  schema: fhsSubmitSizingZ,
  handler: (req) => fhsSubmitSizing(req.body, req.authUser),
});

async function fhsSubmitSizing(dto: FhsSubmitSizingT, from: UserT) {
  const {
    id,
    hp,
    comment,
    uploads,
    FHS_SIZING_KMZ,
    FHS_COORDINATES,
    FHS_SYNOPTIC_TABLE,
    FHS_SYNOPTIC_DIAGRAM,
    FHS_PLAN_DIAGRAM,
    ...fields
  } = dto;
  const { s } = await fhsCheck({
    workId: id,
    status: [WorkStatus.SIZING, WorkStatus.SIZING_REJECTED],
  });

  return prisma.ftthSurvey.update({
    select: ftthSurveyS,
    where: { id },
    data: {
      hp,
      quantity: { upsert: { create: fields, update: fields } },
      work: updateWork({
        dto,
        work: s.work,
        sender: from,
        action: WorkAction.SUBMIT_SIZING,
        status: WorkStatus.SIZING_VALIDATION,
        logTo: fhsWorker(s)?.name,
        docs: {
          FHS_SIZING_KMZ,
          FHS_COORDINATES,
          FHS_SYNOPTIC_TABLE,
          FHS_SYNOPTIC_DIAGRAM,
          FHS_PLAN_DIAGRAM,
        },
      }),
    },
  });
}
