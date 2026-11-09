import type { WorkDocType } from "#/db";
import { parseUpAreaKmz } from "./up-area-kmz";
import { parseUpFhsBom } from "./up-fhs-bom";
import { parseUpFhsCoords } from "./up-fhs-coords";
import { parseUpFhsSizingKmz } from "./up-fhs-sizing-kmz";
import type { ParserFunc, ParserInput } from "./utils";

type Parsers = { [t in WorkDocType]?: ParserFunc };

const parsers: Parsers = {
  FHS_AREA_KMZ: parseUpAreaKmz,
  FHS_SIZING_KMZ: parseUpFhsSizingKmz,
  FHS_COORDINATES: parseUpFhsCoords,
  FHS_BOM: parseUpFhsBom,
};

export async function maybeParse(input: ParserInput, key?: WorkDocType | null) {
  return (key && (await parsers[key]?.(input))) || null;
}
