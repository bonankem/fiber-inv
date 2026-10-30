import { emrfListZ, emrfS } from "schema/inventory";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { emrfAccess } from "./utils";

export const emrfListApi = getRoute({
  url: "/inventory/emrf",
  schema: emrfListZ,
  handler: async ({ query, authUser }) => {
    const { status,  page, pageSize } = query;
    const where = {
      ...emrfAccess(authUser),
      ...(status && { status }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.emrf.findMany({
        where,
        select: emrfS,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.emrf.count({ where }),
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
