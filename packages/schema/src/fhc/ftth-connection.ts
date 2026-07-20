import { idNameP, idNameZ } from "#/common";
import { workP, workZ } from "#/work";
import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr, zStrNul } from "../utils";

export const ftthConnectionS = {
  id: true,
  work: workP,
  tn: true,
  phone: true,
  email: true,
  address: true,

  ontSerial: true,
  ontOem: idNameP,
  fat: idNameP,
  fatPort: true,
  cableLength: true,
  newPole: true,
} satisfies Prisma.FtthConnectionSelect;

export const ftthConnectionZ = zObject("FtthConnectionT", {
  id: zStr("The entry ID"),
  tn: zStr("The customer's TN"),
  work: workZ.describe("The work instance"),
  phone: zStrNul("The customer's phone number"),
  email: zStrNul("The customer's email address"),
  address: zStrNul("The installation address"),

  ontSerial: zStrNul("The ONT serial number"),
  ontOem: idNameZ.nullable(),
  fat: idNameZ.nullable(),
  fatPort: z.int().nullable(),
  cableLength: z.number().nullable(),
  newPole: z.boolean().nullable(),
} satisfies Record<keyof typeof ftthConnectionS, object>);

export const ftthConnectionP = { select: ftthConnectionS };

type FtthConnectionP = Prisma.FtthConnectionGetPayload<typeof ftthConnectionP>;
type FtthConnectionZ = z.infer<typeof ftthConnectionZ>;

export type FtthConnectionT = Same<FtthConnectionP, FtthConnectionZ>;
