import z from "zod";
import { type Prisma, WorkStatus } from "../db";
import { coordsP, coordsZ } from "../geo/coords";
import { type Same, zObject, zStr, zStrNul } from "../utils";

export const workBriefS = {
  id: true,
  sid: true,
  name: true,
  status: true,
  coords: coordsP,
  vendorId: true,
  localityId: true,
} satisfies Prisma.WorkSelect;

export const workBriefZ = zObject("WorkT", {
  id: zStr("The work entry UUID"),
  sid: zStr("The work entry serial ID e.g. FHS-20260601-0001"),
  name: zStr("The name of this work entry"),
  status: z.enum(WorkStatus).describe("Current status"),
  coords: coordsZ.nullable().describe("The location coordinates"),
  vendorId: zStrNul("The ID of the survey vendor"),
  localityId: zStrNul("The ID of the locality"),
} satisfies Record<keyof typeof workBriefS, object>);

export const workBriefP = { select: workBriefS };

type WorkBriefP = Prisma.WorkGetPayload<typeof workBriefP>;
type WorkBriefZ = z.infer<typeof workBriefZ>;

export type WorkBriefT = Same<WorkBriefP, WorkBriefZ>;
