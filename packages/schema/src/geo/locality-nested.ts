import { idKeyNameP, idKeyNameZ } from "../common";
import type { Prisma } from "../db";
import { type Same, type z, zObject, zStr } from "../utils";

export const localityNestedS = {
  id: true,
  key: true,
  name: true,
  district: idKeyNameP,
} satisfies Prisma.LocalitySelect;

export const localityNestedZ = zObject("LocalityNestedT", {
  id: zStr("The ID of this locality"),
  name: zStr("The name of this locality"),
  key: zStr("A unique searchable key, based on the name"),
  district: idKeyNameZ.describe("The district that contains this locality"),
} satisfies Record<keyof typeof localityNestedS, object>);

export const localityNestedP = { select: localityNestedS };

type LocalityNestedP = Prisma.LocalityGetPayload<typeof localityNestedP>;
type LocalityNestedZ = z.infer<typeof localityNestedZ>;

export type LocalityNestedT = Same<LocalityNestedP, LocalityNestedZ>;
