import { WorkDocType } from "#/prisma";
import { workUpdateDto } from "#/work";
import { z } from "../utils";

export const fhcImageTypes = Object.values(WorkDocType).filter((t) =>
  t.startsWith("FHC_"),
) as (WorkDocType & `FHC_${string}`)[];

export const fhcSubmitZ = workUpdateDto("FhcUpdateT", {
  images: z.partialRecord(z.enum(fhcImageTypes), z.string()),
  ontSerial: z.string(),
  ontOem: z.string(),
  fatId: z.string(),
  fatPort: z.int(),
  oltId: z.string().optional(),
  oltPort: z.int().optional(),
  cableLength: z.int().optional(),
  newPole: z.boolean().optional(),
});

export type FhcSubmitT = z.infer<typeof fhcSubmitZ>;
