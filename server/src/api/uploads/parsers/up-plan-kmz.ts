import type { UpPlanKmzT } from "schema/uploads";
import { WorkDocType } from "#/prisma";
import { filterPlacemarks, parseSimpleKmz } from "./kmz";
import type { ParserInput } from "./utils";

export async function parseUpPlanKmz({
  data,
}: ParserInput): Promise<UpPlanKmzT | null> {
  const kmz = await parseSimpleKmz(data);
  if (!kmz) return null;

  const metalPoles = filterPlacemarks(
    kmz,
    true,
    [/poteau|pole/i, /metal|steel|^s[- ]*\d/iu],
    [/exist/i],
  );

  const concretePoles = filterPlacemarks(
    kmz,
    true,
    [/poteau|pole/i, /b[eé]ton|concrete|^c[- ]*\d/iu],
    [/exist/i],
  );

  console.log({
    metalPoles: metalPoles.length,
    concretePoles: concretePoles.length,
    all: kmz.length,
  });

  return {
    type: WorkDocType.PLAN_KMZ,
    metalPoles,
    concretePoles,
  };
}
