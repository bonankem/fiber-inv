import { type Prisma, type Same, type z, zObject, zStr } from "../common";

export const idNameS = {
  id: true,
  name: true,
} satisfies Prisma.UserSelect;

export const idNameZ = zObject("IdNameT", {
  id: zStr("The ID"),
  name: zStr("The name"),
} satisfies Record<keyof typeof idNameS, object>);

export const idNameP = { select: idNameS };

type IdNameP = Prisma.UserGetPayload<typeof idNameP>;
type IdNameZ = z.infer<typeof idNameZ>;

export type IdNameT = Same<IdNameP, IdNameZ>;
