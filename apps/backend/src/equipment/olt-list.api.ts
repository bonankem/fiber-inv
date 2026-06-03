import { oltP } from "schema/equipment";
import { prisma } from "#/db";
import { getRoute } from "#/utils";

export default getRoute("/equipment/olt", null, oltList);

async function oltList() {
  return prisma.olt.findMany(oltP);
}
