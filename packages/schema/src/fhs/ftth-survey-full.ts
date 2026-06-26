import { workFullP, workFullZ } from "#/work/work-full";
import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr } from "../utils";
import { fhsReportP, fhsReportZ } from "./fhs-report";

export const ftthSurveyFullS = {
  id: true,
  work: workFullP,
  isNewArea: true,
  report: fhsReportP,
} satisfies Prisma.FtthSurveySelect;

export const ftthSurveyFullZ = zObject("FtthSurveyFullT", {
  id: zStr("The survey ID"),
  work: workFullZ,
  report: fhsReportZ.nullable(),
  isNewArea: z.boolean("Does this survey add a new FTTH area code?"),
} satisfies Record<keyof typeof ftthSurveyFullS, object>);

export const ftthSurveyFullP = { select: ftthSurveyFullS };

type FtthSurveyFullP = Prisma.FtthSurveyGetPayload<typeof ftthSurveyFullP>;
type FtthSurveyFullZ = z.infer<typeof ftthSurveyFullZ>;

export type FtthSurveyFullT = Same<FtthSurveyFullP, FtthSurveyFullZ>;
