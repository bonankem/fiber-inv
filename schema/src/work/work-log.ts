import {
  type Prisma,
  type Same,
  WorkAction,
  WorkStatus,
  z,
  zObject,
  zStr,
} from "../base";
import { idNameP, idNameZ } from "../common";

export const workLogS = {
  id: true,
  action: true,
  newStatus: true,
  fromUser: idNameP,
  toNames: true,
  uploads: idNameP,
} satisfies Prisma.WorkLogSelect;

export const workLogZ = zObject("WorkLogT", {
  id: zStr("The log ID"),
  action: z.enum(WorkAction).describe("The action performed"),
  newStatus: z
    .enum(WorkStatus)
    .nullable()
    .describe("The changed status, or null if it did not change"),
  fromUser: idNameZ.nullable().describe("The user who performed the action"),
  toNames: z.array(z.string()).describe("The direct recipients of the action"),
  uploads: z.array(idNameZ).describe("Attachments, if any"),
} satisfies Record<keyof typeof workLogS, object>);

export const workLogP = { select: workLogS };

type WorkLogP = Prisma.WorkLogGetPayload<typeof workLogP>;
type WorkLogZ = z.infer<typeof workLogZ>;

export type WorkLogT = Same<WorkLogP, WorkLogZ>;
