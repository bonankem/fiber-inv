import { bad, Err } from "schema/errors";
import { equipmentS } from "schema/inventory";
import { z } from "schema/utils";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

const equipmentGetZ = z.object({
  id: z.uuid(),
});

export const equipmentGetApi = getRoute({
  url: "/inventory/equipment/get",
  schema: equipmentGetZ,
  handler: async ({ query }) => {
    const equipment = await prisma.equipment.findUnique({
      where: { id: query.id },
      select: equipmentS,
    });
    if (!equipment) bad(Err.NOT_FOUND);

    return equipment;
  },
});
