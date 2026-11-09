import { z } from "zod";
import { EmrfStatus } from "../db";

export const emrfListZ = z.object({
  status: z.nativeEnum(EmrfStatus).optional(),
  // the HP Planning job the EMRFs were raised for
  surveyId: z.uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type EmrfListT = z.infer<typeof emrfListZ>;
