import {
  type Prisma,
  type Same,
  type z,
  zObject,
  zStr,
  zStrNul,
} from "../common";
import { workP, workZ } from "../work/work";

export const ftthSurveyS = {
  id: true,
  work: workP,
  contact: true,
} satisfies Prisma.FtthSurveySelect;

export const ftthSurveyZ = zObject("FtthSurveyT", {
  id: zStr("The work entry UUID"),
  work: workZ,
  contact: zStrNul("The local contact information"),
} satisfies Record<keyof typeof ftthSurveyS, object>);

export const ftthSurveyP = { select: ftthSurveyS };

type FtthSurveyP = Prisma.FtthSurveyGetPayload<typeof ftthSurveyP>;
type FtthSurveyZ = z.infer<typeof ftthSurveyZ>;

export type FtthSurveyT = Same<FtthSurveyP, FtthSurveyZ>;
