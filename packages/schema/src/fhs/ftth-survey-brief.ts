import { workBriefP, workBriefZ } from "#/work";
import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr, zStrNul } from "../utils";

export const ftthSurveyBriefS = {
  id: true,
  work: workBriefP,
  contact: true,
  isNewArea: true,
  reportedHp: true,
} satisfies Prisma.FtthSurveySelect;

export const ftthSurveyBriefZ = zObject("FtthSurveyBriefT", {
  id: zStr("The survey ID"),
  work: workBriefZ.describe("Work details"),
  contact: zStrNul("Client contact info"),
  reportedHp: z.int().nullable().describe("Reported HP"),
  isNewArea: z.boolean("Does this survey add a new FTTH area code?"),
} satisfies Record<keyof typeof ftthSurveyBriefS, object>);

export const ftthSurveyBriefP = { select: ftthSurveyBriefS };

type FtthSurveyBriefP = Prisma.FtthSurveyGetPayload<typeof ftthSurveyBriefP>;
type FtthSurveyBriefZ = z.infer<typeof ftthSurveyBriefZ>;

export type FtthSurveyBriefT = Same<FtthSurveyBriefP, FtthSurveyBriefZ>;
