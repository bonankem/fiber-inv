import { oltP } from "schema/network";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const oltListApi = getRoute({
  url: "/network/olt",
  handler: oltList,
});

async function oltList() {
  return prisma.olt.findMany(oltP);
}
