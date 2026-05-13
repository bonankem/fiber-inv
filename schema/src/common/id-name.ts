import type z from "zod";
import { type Prisma, type Same, zObject, zStr } from "../base";

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
