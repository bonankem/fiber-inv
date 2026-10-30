import { bad, Err } from "schema/errors";
import { emrfS } from "schema/inventory";
import { z } from "schema/utils";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { emrfAccess } from "./utils";

const emrfGetZ = z.object({
  id: z.uuid(),
});

export const emrfGetApi = getRoute({
  url: "/inventory/emrf/get",
  schema: emrfGetZ,
  handler: async ({ query, authUser }) => {
    const emrf = await prisma.emrf.findFirst({
      where: { id: query.id, ...emrfAccess(authUser) },
      select: emrfS,
    });

    if (!emrf) bad(Err.NOT_FOUND);

    return emrf;
  },
});
