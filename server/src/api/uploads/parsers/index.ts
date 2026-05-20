import type { WorkDocType } from "#/prisma";
import { parseUpFhsCoords } from "./up-fhs-coords";
import { parseUpPlaqueKmz } from "./up-plaque-kmz";
import type { ParserFunc, ParserInput } from "./utils";

type Parsers = { [t in WorkDocType]?: ParserFunc };

const parsers: Parsers = {
  PLAQUE_KMZ: parseUpPlaqueKmz,
  COORDINATES: parseUpFhsCoords,
};

export async function maybeParse(input: ParserInput, key?: WorkDocType | null) {
  return (key && (await parsers[key]?.(input))) || null;
}
