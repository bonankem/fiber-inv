import { oltListP } from "schema/network";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const netOltsListApi = getRoute({
  url: "/network/olts",
  handler: netOltsList,
});

async function netOltsList() {
  return prisma.olt.findMany(oltListP);
}
