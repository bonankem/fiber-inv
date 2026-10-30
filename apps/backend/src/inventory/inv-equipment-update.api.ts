import { bad, Err } from "schema/errors";
import {
  type EquipmentUpdateT,
  equipmentS,
  equipmentUpdateZ,
} from "schema/inventory";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const equipmentUpdateApi = postRoute({
  url: "/inventory/equipment/update",
  schema: equipmentUpdateZ,
  allow: Allow.STAFF,
  handler: ({ body }) => updateEquipment(body),
});

async function updateEquipment(dto: EquipmentUpdateT) {
  const { id, ...changes } = dto;
  const existing = await prisma.equipment.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) bad(Err.NOT_FOUND);
  if (changes.mtnCode) {
    const duplicate = await prisma.equipment.findFirst({
      where: {
        mtnCode: changes.mtnCode,
        id: { not: id },
      },
      select: { id: true },
    });

    if (duplicate) bad(Err.ALREADY_EXISTS, changes.mtnCode);
  }
  return prisma.equipment.update({
    where: { id },
    data: changes,
    select: equipmentS,
  });
}
