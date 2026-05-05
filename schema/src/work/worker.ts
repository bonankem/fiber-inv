import { type Prisma, type Same, StaffRole, z, zObject } from "../common";
import { idNameP, idNameZ } from "../common/id-name";

export const workerS = {
  user: idNameP,
  role: true,
} satisfies Prisma.WorkerSelect;

export const workerZ = zObject("WorkerT", {
  user: idNameZ,
  role: z.enum(StaffRole),
} satisfies Record<keyof typeof workerS, object>);

export const workerP = { select: workerS };

type WorkerP = Prisma.WorkerGetPayload<typeof workerP>;
type WorkerZ = z.infer<typeof workerZ>;

export type WorkerT = Same<WorkerP, WorkerZ>;
