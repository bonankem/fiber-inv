import { oltAddManyZ, oltListP, oltS } from "schema/network";
import { prisma } from "#/db";
import { connectIdOrKey } from "#/utils/ids";
import { makeKey } from "#/utils/queries";
import { getRoute, postRoute } from "#/utils/routing";

const db = prisma.olt;

export const oltListApi = getRoute({
  url: "/network/olt",
  handler: () => db.findMany(oltListP),
});

export const oltAddApi = postRoute({
  url: "/network/olt",
  schema: oltAddManyZ,
  handler: ({ body }) => {
    const query = body.names.map((name) => {
      const oem = connectIdOrKey(body.oem);
      const key = makeKey(name);
      return db.upsert({
        where: { key },
        create: { name, oem, key },
        update: { name, oem },
        select: oltS,
      });
    });
    return prisma.$transaction(query);
  },
});
