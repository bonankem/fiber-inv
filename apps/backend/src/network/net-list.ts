import { idKeyNameListP } from "schema/common";
import { boxListP, oltListP } from "schema/network";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const netListApi = getRoute({
  url: "/network",
  handler: netList,
});

async function netList() {
  const oems = await prisma.oem.findMany(idKeyNameListP);
  const olts = await prisma.olt.findMany(oltListP);
  const boxes = await prisma.ftthBox.findMany(boxListP);

  return { oems, olts, boxes };
}
