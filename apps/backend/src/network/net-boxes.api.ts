import { boxListP } from "schema/network";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const boxesApi = getRoute({
  url: "/network/boxes",
  handler: listBoxes,
});

async function listBoxes() {
  return prisma.ftthBox.findMany(boxListP);
}
