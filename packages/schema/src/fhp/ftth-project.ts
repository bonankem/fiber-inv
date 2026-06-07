import { workP, workZ } from "#/work";
import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr, zStrNul } from "../utils";

export const ftthProjectS = {
  id: true,
  work: workP,
  surveyId: true,
  contact: true,
  hp: true,
} satisfies Prisma.FtthProjectSelect;

export const ftthProjectZ = zObject("FtthProjectT", {
  id: zStr("The work entry UUID"),
  work: workZ,
  surveyId: zStrNul("The ID of the related survey"),
  contact: zStrNul("Client contact information"),
  hp: z.int().describe("Reported HP"),
} satisfies Record<keyof typeof ftthProjectS, object>);

export const ftthProjectP = { select: ftthProjectS };

type FtthProjectP = Prisma.FtthProjectGetPayload<typeof ftthProjectP>;
type FtthProjectZ = z.infer<typeof ftthProjectZ>;

export type FtthProjectT = Same<FtthProjectP, FtthProjectZ>;
