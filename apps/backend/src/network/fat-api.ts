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
      area: areaFromFatName(i.name),
    }));
    await prisma.coords.createMany(createManyCoords(items));
    return db.createMany({ data, skipDuplicates: true });
  },
});

const FAT_NAME_1 = /^(\w{5,6})[-_]X\d+([-_]H\d+([-_]([SE])\d+)?)?$/;
const FAT_NAME_2 = /^(\w+?)[-_ ]*(PBO?|AB|BCI?)[-_ ]*\d+/;
const FAT_NAME_3 = /^(\w+?)[-_ ]*\d+$/;

function areaFromFatName(name: string) {
  let m = FAT_NAME_1.exec(name);
  if (m) return m[1];

  m = FAT_NAME_2.exec(name);
  if (m) return m[1];

  m = FAT_NAME_3.exec(name);
  if (m) return m[1];

  return null;
}
