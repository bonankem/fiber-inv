import { Subset } from "../common";
import { WorkStatus } from "../prisma";
import { z, zEnumUpper, zFormObject } from "../utils";

export const fhpFilterZ = zFormObject("FhpFilterT", {
  sid: z.string().optional(),
  worker: z.string().optional(),
  vendor: z.string().optional(),
  status: zEnumUpper(WorkStatus).optional(),
  subset: zEnumUpper(Subset).optional(),
  requested: z.iso.date().optional(),
  pending: z.string().optional(),

  page: z.int().optional(),
  count: z.int().min(0).default(100),
});

export type FhpFilterT = z.infer<typeof fhpFilterZ>;
