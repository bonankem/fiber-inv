import { boxListP } from "schema/network";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const boxListApi = getRoute({
  url: "/network/boxes",
  handler: boxList,
});

async function boxList() {
  return prisma.ftthBox.findMany(boxListP);
}
