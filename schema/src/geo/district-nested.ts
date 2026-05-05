import { type Prisma, type Same, type z, zObject, zStr } from "../common";
import { cityP, cityZ } from "./city";

export const districtNestedS = {
  id: true,
  name: true,
  key: true,
  cities: cityP,
} satisfies Prisma.DistrictSelect;

export const districtNestedZ = zObject("DistrictNestedT", {
  id: zStr("The district UUID"),
  name: zStr("The district name"),
  key: zStr("The district key (normalized form of the name"),
  cities: cityZ.array().describe("Cities in this district"),
} satisfies Record<keyof typeof districtNestedS, object>);

export const districtNestedP = {
  select: districtNestedS,
  orderBy: { key: "asc" },
} satisfies Prisma.DistrictFindManyArgs;

type DistrictNestedP = Prisma.DistrictGetPayload<typeof districtNestedP>;
type DistrictNestedZ = z.infer<typeof districtNestedZ>;

export type DistrictNestedT = Same<DistrictNestedP, DistrictNestedZ>;
