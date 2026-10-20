import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";
import { workBriefP, workBriefZ } from "../work";

export const ftthSurveyBriefS = {
  id: true,
  work: workBriefP,
  area: true,
  reportedHp: true,
} satisfies Prisma.FtthSurveySelect;

export const ftthSurveyBriefZ = zObject("FtthSurveyBriefT", {
  id: zStr("The survey ID"),
  work: workBriefZ.describe("Work details"),
  area: zStr("The FTTH area code").nullable(),
  reportedHp: z.int().nullable().describe("Reported HP"),
} satisfies Record<keyof typeof ftthSurveyBriefS, object>);

export const ftthSurveyBriefP = { select: ftthSurveyBriefS };

type FtthSurveyBriefP = Prisma.FtthSurveyGetPayload<typeof ftthSurveyBriefP>;
type FtthSurveyBriefZ = z.infer<typeof ftthSurveyBriefZ>;

export type FtthSurveyBriefT = Same<FtthSurveyBriefP, FtthSurveyBriefZ>;
