import { Subset } from "../common";
import { WorkStatus } from "../db";
import { z, zEnumUpper, zFormObject } from "../utils";

export const fhcFilterZ = zFormObject("FhcFilterT", {
  sid: z.string().optional(),
  name: z.string().optional(),
  vendor: z.string().optional(),
  status: zEnumUpper(WorkStatus).optional(),
  subset: zEnumUpper(Subset).optional(),
  requested: z.iso.date().optional(),
  pending: z.string().optional(),
  localityId: z.string().optional(),

  tn: z.string().optional(),

  page: z.int().optional(),
  count: z.int().min(0).default(100),
});

export type FhcFilterT = z.infer<typeof fhcFilterZ>;
