import { bad, Err } from "schema/errors";
import { equipmentS, type StockAdjustT, stockAdjustZ } from "schema/inventory";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const stockAdjustApi = postRoute({
  url: "/inventory/stock/adjust",
  schema: stockAdjustZ,
  allow: Allow.STAFF,
  handler: ({ body }) => adjustStock(body),
});

async function adjustStock({ id, changes }: StockAdjustT) {
  return prisma.$transaction(async (tx) => {
    const equipment = await tx.equipment.findUnique({
      where: { id },
      select: { id: true, available: true },
    });

    if (!equipment) bad(Err.NOT_FOUND);

    const result = await tx.equipment.updateMany({
      where: {
        id,
        available: { gte: Math.max(0, -changes) },
      },
      data: {
        available: { increment: changes },
      },
    });
    if (result.count === 0) {
      bad(Err.INVALID_INPUT, `Only ${equipment.available} in stock`);
    }

    return tx.equipment.findUniqueOrThrow({
      where: { id },
      select: equipmentS,
    });
  });
}
