import { idKeyNameP, idKeyNameZ } from "#/common";
import type { Prisma } from "../prisma";
import { type Same, type z, zObject, zStr, zStrNul } from "../utils";

export const oltS = {
  id: true,
  key: true,
  name: true,
  mtnSite: true,
  ip: true,
  oem: idKeyNameP,
} satisfies Prisma.OltSelect;

export const oltZ = zObject("OltT", {
  id: zStr("The ID of this entry"),
  key: zStr("The unique searchable key"),
  name: zStr("The equipment name"),
  mtnSite: zStrNul("The MTN Site ID"),
  oem: idKeyNameZ.describe("The equipment OEM"),
  ip: zStrNul("The OLT IP address, if known"),
} satisfies Record<keyof typeof oltS, object>);

export const oltP = {
  select: oltS,
  orderBy: { key: "asc" },
} satisfies Prisma.OltFindManyArgs;

type OltP = Prisma.OltGetPayload<typeof oltP>;
type OltZ = z.infer<typeof oltZ>;

export type OltT = Same<OltP, OltZ>;
