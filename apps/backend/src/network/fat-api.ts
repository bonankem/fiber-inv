import { bad, Err } from "schema/errors";
import { fatAddManyZ, fatListP } from "schema/network";
import { prisma } from "#/db";
import { createManyCoords, getCoordsId } from "#/utils/queries";
import { getRoute, postRoute } from "#/utils/routing";

const db = prisma.fat;

export const fatListApi = getRoute({
  url: "/network/fat",
  handler: () => db.findMany(fatListP),
});

export const fatAddApi = postRoute({
  url: "/network/fat",
  schema: fatAddManyZ,
  handler: async (req) => {
    const { items } = req.body;
    const data = items.map((i) => ({
      name: i.name,
      oltId: i.oltId,
      coordsId: i.coords && getCoordsId(i.coords),
      area: checkFatName(i.name)[1] || null,
    }));
    await prisma.coords.createMany(createManyCoords(items));
    return db.createMany({ data, skipDuplicates: true });
  },
});

const VALID_BOX = /^(\w{5,6})_X\d+(_H\d+(?:_([SE])\d+)?)?$|^\w+.?PBO?.?\d+/;
function checkFatName(name: string) {
  return VALID_BOX.exec(name) ?? bad(Err.INVALID_NAME, name);
}
