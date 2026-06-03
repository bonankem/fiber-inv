import type { WorkDocType } from "#/db";
import { parseUpFhsCoords } from "./up-fhs-coords";
import { parseUpPlanKmz } from "./up-plan-kmz";
import { parseUpPlaqueKmz } from "./up-plaque-kmz";
import type { ParserFunc, ParserInput } from "./utils";

type Parsers = { [t in WorkDocType]?: ParserFunc };

const parsers: Parsers = {
  PLAQUE_KMZ: parseUpPlaqueKmz,
  PLAN_KMZ: parseUpPlanKmz,
  COORDINATES: parseUpFhsCoords,
};

export async function maybeParse(input: ParserInput, key?: WorkDocType | null) {
  return (key && (await parsers[key]?.(input))) || null;
}
