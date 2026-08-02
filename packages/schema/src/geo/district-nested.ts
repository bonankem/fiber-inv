import type { Prisma } from "../db";
import type { z } from "../utils";
import { type Same, zObject, zStr } from "../utils";
import { localityListP, localityZ } from "./locality";

export const districtNestedS = {
  id: true,
  name: true,
  key: true,
  localities: localityListP,
} satisfies Prisma.DistrictSelect;

export const districtNestedZ = zObject("DistrictNestedT", {
  id: zStr("The district UUID"),
  name: zStr("The district name"),
  key: zStr("The district key (normalized form of the name"),
  localities: localityZ.array().describe("Localities in this district"),
} satisfies Record<keyof typeof districtNestedS, object>);

export const districtNestedP = {
  select: districtNestedS,
  orderBy: { key: "asc" },
} satisfies Prisma.DistrictFindManyArgs;

type DistrictNestedP = Prisma.DistrictGetPayload<typeof districtNestedP>;
type DistrictNestedZ = z.infer<typeof districtNestedZ>;

export type DistrictNestedT = Same<DistrictNestedP, DistrictNestedZ>;
