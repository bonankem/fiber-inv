import { bad, Err } from "schema/errors";
import { emrfCollectionS } from "schema/inventory";
import { z } from "schema/utils";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { emrfAccess } from "./utils";

const emrfCollectionZ = z.object({
  id: z.uuid(),
});

// what the vendor collected for an EMRF
export const emrfCollectionApi = getRoute({
  url: "/inventory/emrf/collection",
  schema: emrfCollectionZ,
  handler: async ({ query, authUser }) => {
    const emrf = await prisma.emrf.findFirst({
      where: { id: query.id, ...emrfAccess(authUser) },
      select: emrfCollectionS,
    });

    if (!emrf) bad(Err.NOT_FOUND);
    if (!emrf.collectedAt) bad(Err.NOT_FOUND, "Collection");

    return emrf;
  },
});
