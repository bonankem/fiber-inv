import { workP, workZ } from "#/work";
import type { Prisma } from "../prisma";
import { type Same, type z, zObject, zStr, zStrNul } from "../utils";

export const ftthConnectionS = {
  id: true,
  work: workP,
  phone: true,
  email: true,
  address: true,
} satisfies Prisma.FtthConnectionSelect;

export const ftthConnectionZ = zObject("FtthConnectionT", {
  id: zStr("The entry ID"),
  work: workZ.describe("The work instance"),
  phone: zStrNul("The customer's phone number"),
  email: zStrNul("The customer's email address"),
  address: zStrNul("The installation address"),
} satisfies Record<keyof typeof ftthConnectionS, object>);

export const ftthConnectionP = { select: ftthConnectionS };

type FtthConnectionP = Prisma.FtthConnectionGetPayload<typeof ftthConnectionP>;
type FtthConnectionZ = z.infer<typeof ftthConnectionZ>;

export type FtthConnectionT = Same<FtthConnectionP, FtthConnectionZ>;
