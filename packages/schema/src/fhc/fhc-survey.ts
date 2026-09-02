import { FhcMode, WorkDocType } from "#/db";
import { workUpdateDto } from "#/work";
import { z, zStr } from "../utils";
import { fhcNextPhases } from "./fhc-status";

export const fhcSurveyZ = workUpdateDto("FhcSurveyT", {
  [WorkDocType.SURVEY_REPORT]: zStr("Survey report upload ID"),
  nextPhase: z.enum(fhcNextPhases),
  mode: z.enum(FhcMode),
  withPole: z.boolean(),
});

export type FhcSurveyT = z.infer<typeof fhcSurveyZ>;
