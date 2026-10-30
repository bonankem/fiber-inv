import { z } from "../utils";

export const equipmentUpdateZ = z.object({
  id: z.uuid(),
  mtnCode: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullish(),
  ifsCode: z.string().trim().nullish(),
  partNumber: z.string().trim().nullish(),
  manufacturer: z.string().trim().nullish(),
  tag: z.string().trim().nullish(),
  available: z.int().min(0).optional(),
  dateSynced: z.string().trim().nullish(),
});

export type EquipmentUpdateT = z.infer<typeof equipmentUpdateZ>;
