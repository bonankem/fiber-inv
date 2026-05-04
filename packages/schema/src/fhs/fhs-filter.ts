import { WorkStatus, z, zEnumUpper, zObject } from "../common";

export const fhsFilterZ = zObject("FhsFilterT", {
  sid: z.string().optional(),
  worker: z.string().optional(),
  vendor: z.string().optional(),
  status: zEnumUpper(WorkStatus).optional(),
  requested: z.iso.date().optional(),
  count: z.int().min(0).default(100),
  page: z.int().optional(),
});

export type FhsFilterT = z.infer<typeof fhsFilterZ>;
