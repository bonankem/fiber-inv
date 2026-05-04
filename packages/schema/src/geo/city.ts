import { type Prisma, type Same, type z, zObject, zStr } from "../common";

export const cityS = {
  id: true,
  key: true,
  name: true,
} satisfies Prisma.CitySelect;

export const cityZ = zObject("CityT", {
  id: zStr("The city UUID"),
  name: zStr("The city name"),
  key: zStr("The city key (normalized form of the name)"),
} satisfies Record<keyof typeof cityS, object>);

export const cityP = {
  select: cityS,
  orderBy: { key: "asc" },
} satisfies Prisma.CityFindManyArgs;

type CityP = Prisma.CityGetPayload<typeof cityP>;
type CityZ = z.infer<typeof cityZ>;

export type CityT = Same<CityP, CityZ>;
