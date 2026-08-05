import { boxListP } from "schema/network";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const netBoxesListApi = getRoute({
  url: "/network/boxes",
  handler: netBoxesList,
});

async function netBoxesList() {
  return prisma.ftthBox.findMany(boxListP);
}
