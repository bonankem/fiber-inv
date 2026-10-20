import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";
import { equipmentBriefP, equipmentBriefZ } from "./equipment-brief";

export const emrfItemS = {
  id: true,
  equipment: equipmentBriefP,
  requestedQty: true,
  collectedQty: true,
} satisfies Prisma.EmrfItemSelect;

export const emrfItemZ = zObject("EmrfItemT", {
  id: zStr("EMRF ID"),
  equipment: equipmentBriefZ,
  requestedQty: z.int().describe("Requested quantity"),
  collectedQty: z.int().describe("Collected quantity"),
} satisfies Record<keyof typeof emrfItemS, object>);

export const emrfItemP = { select: emrfItemS };

export const emrfItemListP = {
  select: emrfItemS,
} satisfies Prisma.EmrfItemFindManyArgs;

type EmrfItemP = Prisma.EmrfItemGetPayload<typeof emrfItemP>;
type EmrfItemZ = z.infer<typeof emrfItemZ>;

export type EmrfItemT = Same<EmrfItemP, EmrfItemZ>;
