import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr, zStrNul } from "../utils";
import { workP, workZ } from "../work/work";

export const ftthSurveyS = {
  id: true,
  work: workP,
  contact: true,
  isNewArea: true,
} satisfies Prisma.FtthSurveySelect;

export const ftthSurveyZ = zObject("FtthSurveyT", {
  id: zStr("The work entry UUID"),
  work: workZ,
  contact: zStrNul("The local contact information"),
  isNewArea: z.boolean("Does this survey add a new FTTH area code?"),
} satisfies Record<keyof typeof ftthSurveyS, object>);

export const ftthSurveyP = { select: ftthSurveyS };

type FtthSurveyP = Prisma.FtthSurveyGetPayload<typeof ftthSurveyP>;
type FtthSurveyZ = z.infer<typeof ftthSurveyZ>;

export type FtthSurveyT = Same<FtthSurveyP, FtthSurveyZ>;
