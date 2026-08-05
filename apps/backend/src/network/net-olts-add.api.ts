import { type OltAddManyT, oltAddManyZ, oltS } from "schema/network";
import { prisma } from "#/db";
import { connectIdOrKey } from "#/utils/ids";
import { makeKey } from "#/utils/queries";
import { postRoute } from "#/utils/routing";

export const netOltsAddApi = postRoute({
  url: "/network/olts",
  schema: oltAddManyZ,
  handler: (req) => netOltsAdd(req.body),
});

async function netOltsAdd(dto: OltAddManyT) {
  const query = dto.names.map((name) => {
    const key = makeKey(name);
    const oem = connectIdOrKey(dto.oem);
    return prisma.olt.upsert({
      where: { key },
      create: { name, oem, key },
      update: { name, oem },
      select: oltS,
    });
  });
  return prisma.$transaction(query);
}
