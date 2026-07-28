import type { WorkDocType } from "#/db";
import { parseUpAreaKmz } from "./up-area-kmz";
import { parseUpFhsCoords } from "./up-fhs-coords";
import { parseUpOdnKmz } from "./up-odn-kmz";
import type { ParserFunc, ParserInput } from "./utils";

type Parsers = { [t in WorkDocType]?: ParserFunc };

const parsers: Parsers = {
  AREA_KMZ: parseUpAreaKmz,
  ODN_KMZ: parseUpOdnKmz,
  COORDINATES: parseUpFhsCoords,
};

export async function maybeParse(input: ParserInput, key?: WorkDocType | null) {
  return (key && (await parsers[key]?.(input))) || null;
}
