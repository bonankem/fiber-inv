import type { WorkDocType } from "#/prisma";
import { parsePlaqueKmz } from "./plaque-kmz";
import type { ParserFunc, ParserInput } from "./utils";

type Parsers = { [t in WorkDocType]?: ParserFunc };

const parsers: Parsers = {
  PLAQUE_KMZ: parsePlaqueKmz,
};

export async function maybeParse(input: ParserInput, key?: WorkDocType | null) {
  return (key && (await parsers[key]?.(input))) || undefined;
}
