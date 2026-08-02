import { workFullP, workFullZ } from "#/work/work-full";
import type { Prisma } from "../db";
import { type Same, type z, zObject, zStr } from "../utils";
import { fhsReportP, fhsReportZ } from "./fhs-report";

export const ftthSurveyFullS = {
  id: true,
  work: workFullP,
  area: true,
  report: fhsReportP,
} satisfies Prisma.FtthSurveySelect;

export const ftthSurveyFullZ = zObject("FtthSurveyFullT", {
  id: zStr("The survey ID"),
  work: workFullZ,
  area: zStr("The FTTH area code").nullable(),
  report: fhsReportZ.nullable(),
} satisfies Record<keyof typeof ftthSurveyFullS, object>);

export const ftthSurveyFullP = { select: ftthSurveyFullS };

type FtthSurveyFullP = Prisma.FtthSurveyGetPayload<typeof ftthSurveyFullP>;
type FtthSurveyFullZ = z.infer<typeof ftthSurveyFullZ>;

export type FtthSurveyFullT = Same<FtthSurveyFullP, FtthSurveyFullZ>;
