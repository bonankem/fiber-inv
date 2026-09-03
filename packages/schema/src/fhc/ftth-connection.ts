import { idKeyNameP, idKeyNameZ, idNameP, idNameZ } from "#/common";
import { workP, workZ } from "#/work";
import { FhcMode, type Prisma } from "../db";
import { type Same, z, zObject, zStr, zStrNul } from "../utils";

export const ftthConnectionS = {
  id: true,
  work: workP,
  tn: true,
  phone: true,
  email: true,

  olt: idNameP,
  fat: idNameP,
  oltSlot: true,
  oltPort: true,
  fatPort: true,
  ontSerial: true,
  ontOem: idKeyNameP,
  mode: true,
  distance: true,
  withPole: true,
} satisfies Prisma.FtthConnectionSelect;

export const ftthConnectionZ = zObject("FtthConnectionT", {
  id: zStr("The entry ID"),
  tn: zStr("The customer's TN"),
  work: workZ.describe("The work instance"),
  phone: zStrNul("The customer's phone number"),
  email: zStrNul("The customer's email address"),

  olt: idNameZ.nullable(),
  fat: idNameZ.nullable(),
  oltSlot: z.int().nullable(),
  oltPort: z.int().nullable(),
  fatPort: z.int().nullable(),
  ontSerial: zStrNul("The ONT serial number"),
  ontOem: idKeyNameZ.nullable(),
  mode: z.enum(FhcMode).nullable(),
  distance: z.number().nullable(),
  withPole: z.boolean().nullable(),
} satisfies Record<keyof typeof ftthConnectionS, object>);

export const ftthConnectionP = { select: ftthConnectionS };

type FtthConnectionP = Prisma.FtthConnectionGetPayload<typeof ftthConnectionP>;
type FtthConnectionZ = z.infer<typeof ftthConnectionZ>;

export type FtthConnectionT = Same<FtthConnectionP, FtthConnectionZ>;
