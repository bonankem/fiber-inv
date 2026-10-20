import type { Prisma } from "../db";
import { type Same, type z, zObject, zStr } from "../utils";

export const emrfS = {
  id: true,
} satisfies Prisma.EmrfSelect;

export const emrfZ = zObject("EmrfT", {
  id: zStr(""),
} satisfies Record<keyof typeof emrfS, object>);

export const emrfP = { select: emrfS };

export const emrfListP = {
  select: emrfS,
} satisfies Prisma.EmrfFindManyArgs;

type EmrfP = Prisma.EmrfGetPayload<typeof emrfP>;
type EmrfZ = z.infer<typeof emrfZ>;

export type EmrfT = Same<EmrfP, EmrfZ>;
