import { type Prisma, type Same, type z, zObject, zStr } from "../base";

export const localityS = {
  id: true,
  key: true,
  name: true,
} satisfies Prisma.LocalitySelect;

export const localityZ = zObject("LocalityT", {
  id: zStr("The locality ID"),
  name: zStr("The locality name"),
  key: zStr("The locality key (normalized form of the name)"),
} satisfies Record<keyof typeof localityS, object>);

export const localityP = {
  select: localityS,
  orderBy: { key: "asc" },
} satisfies Prisma.LocalityFindManyArgs;

type LocalityP = Prisma.LocalityGetPayload<typeof localityP>;
type LocalityZ = z.infer<typeof localityZ>;

export type LocalityT = Same<LocalityP, LocalityZ>;
