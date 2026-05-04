import type z from "zod";
import { type Prisma, type Same, zObject, zStr } from "../common";

export const workS = {
  id: true,
  sid: true,
  name: true,
} satisfies Prisma.WorkSelect;

export const workZ = zObject("WorkT", {
  id: zStr("The work entry UUID"),
  sid: zStr("The work entry serial ID e.g. FHS-20260601-0001"),
  name: zStr("The name of this work entry"),
} satisfies Record<keyof typeof workS, object>);

export const workP = { select: workS };

type WorkP = Prisma.WorkGetPayload<typeof workP>;
type WorkZ = z.infer<typeof workZ>;

export type WorkT = Same<WorkP, WorkZ>;
