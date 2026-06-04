import { workDocP, workDocZ } from "#/work";
import type { Prisma } from "../prisma";
import {
  type Same,
  type z,
  zDate,
  zDateNul,
  zObject,
  zStr,
  zStrNul,
} from "../utils";

export const fhpImageS = {
  id: true,
  createdAt: true,
  updatedAt: true,
  takenAt: true,
  name: true,
  type: true,
  doc: workDocP,
} satisfies Prisma.FhpImageSelect;

export const fhpImageZ = zObject("FhpImageT", {
  id: zStr("The entry ID"),
  doc: workDocZ,
  name: zStrNul("The name of the pictured equipment"),
  type: zStr("The type of the pictured equipment"),
  createdAt: zDate("The date this was first uploaded"),
  updatedAt: zDate("The date this was last changed"),
  takenAt: zDateNul("The date the photo was taken"),
} satisfies Record<keyof typeof fhpImageS, object>);

export const fhpImageP = {
  select: fhpImageS,
  orderBy: [{ type: "asc" }, { name: "asc" }],
} satisfies Prisma.FhpImageFindManyArgs;

type FhpImageP = Prisma.FhpImageGetPayload<typeof fhpImageP>;
type FhpImageZ = z.infer<typeof fhpImageZ>;

export type FhpImageT = Same<FhpImageP, FhpImageZ>;
