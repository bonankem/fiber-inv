import { equipmentListZ, equipmentS } from "schema/inventory";
import { type Prisma, prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const equipmentListApi = getRoute({
  url: "/inventory/equipment",
  schema: equipmentListZ,
  handler: async ({ query }) => {
    const { search, codes, page, pageSize } = query;
    const where: Prisma.EquipmentWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { mtnCode: { contains: search, mode: "insensitive" } },
        { ifsCode: { contains: search, mode: "insensitive" } },
        { partNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const codeList = codes
      ?.split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (codeList?.length) {
      where.AND = {
        OR: [{ mtnCode: { in: codeList } }, { ifsCode: { in: codeList } }],
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.equipment.findMany({
        where,
        select: equipmentS,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.equipment.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },
});
