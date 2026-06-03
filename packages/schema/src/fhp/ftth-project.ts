import { workP, workZ } from "#/work";
import type { Prisma } from "../prisma";
import { type Same, type z, zObject, zStr } from "../utils";

export const ftthProjectS = {
  id: true,
  work: workP,
} satisfies Prisma.FtthProjectSelect;

export const ftthProjectZ = zObject("FtthProjectT", {
  id: zStr("The work entry UUID"),
  work: workZ,
} satisfies Record<keyof typeof ftthProjectS, object>);

export const ftthProjectP = { select: ftthProjectS };

type FtthProjectP = Prisma.FtthProjectGetPayload<typeof ftthProjectP>;
type FtthProjectZ = z.infer<typeof ftthProjectZ>;

export type FtthProjectT = Same<FtthProjectP, FtthProjectZ>;
