import { WorkDocType } from "#/prisma";
import { workUpdateDto } from "#/work";
import { z } from "../utils";

const fhcImageTypes = Object.values(WorkDocType).filter((t) =>
  t.startsWith("FHC_"),
) as (WorkDocType & `FHC_${string}`)[];

export const fhcSubmitZ = workUpdateDto("FhcUpdateT", {
  images: z.partialRecord(z.enum(fhcImageTypes), z.string()),
  ontSerial: z.string().optional(),
  ontOem: z.string().optional(),
  oltId: z.string().optional(),
  fatId: z.string().optional(),
  oltPort: z.int().optional(),
  fatPort: z.int().optional(),
  cableLength: z.int().optional(),
});

export type FhcSubmitT = z.infer<typeof fhcSubmitZ>;
