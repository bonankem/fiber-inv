import type { UpPlanKmzT } from "schema/uploads";
import { WorkDocType } from "#/prisma";
import { type ParserInput, parseKmz } from "./utils";

export async function parseUpPlanKmz({
  data,
}: ParserInput): Promise<UpPlanKmzT | null> {
  return {
    type: WorkDocType.PLAN_KMZ,
    text: await parseKmz(data),
  };
}
