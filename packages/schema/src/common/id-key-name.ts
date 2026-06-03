import type z from "zod";
import type { Prisma } from "../prisma";
import { type Same, zObject, zStr } from "../utils";

export const idKeyNameS = {
  id: true,
  key: true,
  name: true,
} satisfies Prisma.UserSelect;

export const idKeyNameZ = zObject("IdKeyNameT", {
  id: zStr("The ID of this record"),
  name: zStr("The name of this record"),
  key: zStr("The key generated from the name"),
} satisfies Record<keyof typeof idKeyNameS, object>);

export const idKeyNameP = { select: idKeyNameS };

type IdKeyNameP = Prisma.UserGetPayload<typeof idKeyNameP>;
type IdKeyNameZ = z.infer<typeof idKeyNameZ>;

export type IdKeyNameT = Same<IdKeyNameP, IdKeyNameZ>;
