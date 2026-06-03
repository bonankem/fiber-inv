import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStrNul } from "../utils";
import { workS, workZ } from "./work";
import { workDocP, workDocZ } from "./work-doc";
import { workLogP, workLogZ } from "./work-log";

export const workFullS = {
  ...workS,
  logs: workLogP,
  docs: workDocP,
  requestDate: true,
  startDate: true,
  dueDate: true,
  closeDate: true,
} satisfies Prisma.WorkSelect;

export const workFullZ = zObject("WorkFullT", {
  ...workZ.shape,
  logs: z.array(workLogZ).describe("Action logs"),
  docs: z.array(workDocZ).describe("Uploaded documents"),
  requestDate: zStrNul("Request date"),
  startDate: zStrNul("Start date"),
  dueDate: zStrNul("Due date"),
  closeDate: zStrNul("Close date"),
} satisfies Record<keyof typeof workFullS, object>);

export const workFullP = { select: workFullS };

type WorkFullP = Prisma.WorkGetPayload<typeof workFullP>;
type WorkFullZ = z.infer<typeof workFullZ>;

export type WorkFullT = Same<WorkFullP, WorkFullZ>;
