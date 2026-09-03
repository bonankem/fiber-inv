import {
  FhcCostCategory as CC,
  type FhcCostCategory,
  FhcMode,
  WorkDocType,
} from "#/db";
import { workUpdateDto } from "#/work";
import { z } from "../utils";
import type { FtthConnectionT } from ".";

export const fhcImageTypes = Object.values(WorkDocType).filter((t) =>
  t.startsWith("FHC_"),
) as (WorkDocType & `FHC_${string}`)[];

export const fhcSubmitZ = workUpdateDto("FhcUpdateT", {
  images: z.partialRecord(z.enum(fhcImageTypes), z.string()),
  ontSerial: z.string(),
  ontOem: z.string(),
  mode: z.enum(FhcMode),
  fatId: z.string(),
  fatPort: z.int(),
  oltId: z.string().optional(),
  oltPort: z.int().optional(),
  distance: z.int(),
  withPole: z.boolean(),
  quantities: z.record(z.string(), z.number().nullable()).optional(),
});

export type FhcSubmitT = z.infer<typeof fhcSubmitZ>;

export function fhcCostCategoryOf(
  t: Pick<FtthConnectionT, "mode" | "distance" | "withPole">,
): FhcCostCategory | null {
  const d = t.distance ?? 0;
  if (t.withPole || d > 300) {
    return CC.PRICE_BOOK;
  }
  if (t.mode === FhcMode.CABLED_BUILDING) {
    return CC.CABLED_BUILDING;
  }
  if (t.mode === FhcMode.PRECONNECTORIZED) {
    return d > 100 ? CC.PRECON_300 : CC.PRECON_100;
  } else {
    return d > 100 ? CC.TRAD_300 : CC.TRAD_100;
  }
}
