import { oltP } from "schema/network";
import { prisma } from "#/db";
import { getRoute } from "#/utils";

export const oltListApi = getRoute("/network/olt", null, oltList);

async function oltList() {
  return prisma.olt.findMany(oltP);
}
