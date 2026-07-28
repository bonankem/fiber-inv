import { WorkDocType } from "#/prisma";
import { workUpdateDto } from "#/work";
import { type z, zStr } from "../utils";

export const fhcSurveyZ = workUpdateDto("FhcSurveyT", {
  [WorkDocType.SURVEY_REPORT]: zStr("Survey report upload ID"),
});

export type FhcSurveyT = z.infer<typeof fhcSurveyZ>;
