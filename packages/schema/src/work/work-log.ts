import { idNameP, idNameZ } from "../common";
import { type Prisma, WorkAction, WorkStatus } from "../db";
import { type Same, z, zDate, zObject, zStr, zStrNul } from "../utils";

export const workLogS = {
  id: true,
  action: true,
  createdAt: true,
  newStatus: true,
  fromUser: idNameP,
  toNames: true,
  comment: true,
  uploads: idNameP,
} satisfies Prisma.WorkLogSelect;

export const workLogZ = zObject("WorkLogT", {
  id: zStr("The log ID"),
  action: z.enum(WorkAction).describe("The action performed"),
  createdAt: zDate("The date/time of the action"),
  newStatus: z
    .enum(WorkStatus)
    .nullable()
    .describe("The changed status, or null if it did not change"),
  fromUser: idNameZ.nullable().describe("The user who performed the action"),
  toNames: z.array(z.string()).describe("The direct recipients of the action"),
  comment: zStrNul("The comment from the sender, if any"),
  uploads: z.array(idNameZ).describe("Attachments, if any"),
} satisfies Record<keyof typeof workLogS, object>);

export const workLogP = {
  select: workLogS,
  orderBy: { createdAt: "asc" },
} satisfies Prisma.WorkLogFindManyArgs;

type WorkLogP = Prisma.WorkLogGetPayload<typeof workLogP>;
type WorkLogZ = z.infer<typeof workLogZ>;

export type WorkLogT = Same<WorkLogP, WorkLogZ>;
