import { localityP, localityZ } from "#/geo";
import type { Prisma } from "../prisma";
import { type Same, type z, zObject, zStr } from "../utils";

export const areaS = {
  id: true,
  code: true,
  locality: localityP,
} satisfies Prisma.FtthAreaSelect;

export const areaZ = zObject("AreaT", {
  id: zStr("The area ID"),
  code: zStr("The five letter code of the area"),
  locality: localityZ.describe("The locality that contains this area"),
} satisfies Record<keyof typeof areaS, object>);

export const areaP = { select: areaS };

export const areaListP = {
  select: areaS,
  orderBy: { code: "asc" },
} satisfies Prisma.FtthAreaFindManyArgs;

type AreaP = Prisma.FtthAreaGetPayload<typeof areaP>;
type AreaZ = z.infer<typeof areaZ>;

export type AreaT = Same<AreaP, AreaZ>;
