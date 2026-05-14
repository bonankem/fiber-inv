import { WorkStatus, z, zEnumUpper } from "../base";
import { Subset } from "../common";
import { zFormObject } from "../utils";

export const fhsFilterZ = zFormObject("FhsFilterT", {
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

export type FhsFilterT = z.infer<typeof fhsFilterZ>;
