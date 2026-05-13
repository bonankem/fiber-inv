import z from "zod";
import { type Prisma, type Same, WorkStatus, zObject, zStr } from "../base";
import { coordsP, coordsZ } from "../geo/coords";
import { localityNestedP, localityNestedZ } from "../geo/locality-nested";
import { vendorP, vendorZ } from "../people";
import { workerP, workerZ } from "./worker";

export const workS = {
  id: true,
  sid: true,
  name: true,
  status: true,
  coords: coordsP,
  vendor: vendorP,
  workers: workerP,
  locality: localityNestedP,
} satisfies Prisma.WorkSelect;

export const workZ = zObject("WorkT", {
  id: zStr("The work entry UUID"),
  sid: zStr("The work entry serial ID e.g. FHS-20260601-0001"),
  name: zStr("The name of this work entry"),
  status: z.enum(WorkStatus).describe("Current status"),
  coords: coordsZ.nullable().describe("The location coordinates"),
  vendor: vendorZ.nullable().describe("Vendor assigned to this work"),
  workers: z.array(workerZ).describe("Workers on this job"),
  locality: localityNestedZ.nullable(),
} satisfies Record<keyof typeof workS, object>);

export const workP = { select: workS };

type WorkP = Prisma.WorkGetPayload<typeof workP>;
type WorkZ = z.infer<typeof workZ>;

export type WorkT = Same<WorkP, WorkZ>;
