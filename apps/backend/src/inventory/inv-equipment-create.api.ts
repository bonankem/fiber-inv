import {
  type EquipmentCreateT,
  equipmentCreateZ,
  equipmentS,
} from "schema/inventory";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const equipmentCreateApi = postRoute({
  url: "/inventory/equipment",
  schema: equipmentCreateZ,
  allow: Allow.STAFF,
  handler: ({ body }) => createEquipment(body),
});

// stock imports send every row here, so an existing MTN code is updated
async function createEquipment(dto: EquipmentCreateT) {
  const data = {
    mtnCode: dto.mtnCode,
    name: dto.name,
    description: dto.description || null,
    ifsCode: dto.ifsCode || null,
    partNumber: dto.partNumber || null,
    manufacturer: dto.manufacturer || null,
    tag: dto.tag || null,
    available: dto.available ?? 0,
    dateSynced: dto.dateSynced || null,
  };

  return prisma.equipment.upsert({
    where: { mtnCode: dto.mtnCode },
    create: data,
    update: data,
    select: equipmentS,
  });
}
