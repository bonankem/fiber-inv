import type { Prisma } from "../db";
import { type Same, z, zArray, zObject, zStr } from "../utils";
import { workFullP, workFullZ } from "../work/work-full";
import { fhsBomItemListP, fhsBomItemZ } from "./fhs-bom-item";
import { fhsQuantityP, fhsQuantityZ } from "./fhs-quantity";

export const ftthSurveyFullS = {
  id: true,
  work: workFullP,
  area: true,
  quantity: fhsQuantityP,
  bom: fhsBomItemListP,
  clusters: true,
  expectedHp: true,
  reportedHp: true,
} satisfies Prisma.FtthSurveySelect;

export const ftthSurveyFullZ = zObject("FtthSurveyFullT", {
  id: zStr("The survey ID"),
  work: workFullZ,
  area: zStr("The FTTH area code").nullable(),
  quantity: fhsQuantityZ.nullable(),
  bom: zArray(fhsBomItemZ).describe("The BOM lines, in order"),
  clusters: z.int().nullable().describe("The number of clusters"),
  expectedHp: z.int().nullable().describe("The expected HP pre-survey"),
  reportedHp: z.int().nullable().describe("The reported HP post-survey"),
} satisfies Record<keyof typeof ftthSurveyFullS, object>);

export const ftthSurveyFullP = { select: ftthSurveyFullS };

type FtthSurveyFullP = Prisma.FtthSurveyGetPayload<typeof ftthSurveyFullP>;
type FtthSurveyFullZ = z.infer<typeof ftthSurveyFullZ>;

export type FtthSurveyFullT = Same<FtthSurveyFullP, FtthSurveyFullZ>;
