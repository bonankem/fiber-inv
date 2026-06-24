import { prisma } from "#/db";
import { getRoute } from "#/utils";

export const listApi = getRoute("/uploads", null, () => {
  return prisma.upload.findMany({
    orderBy: { sentAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      type: true,
      size: true,
    },
  });
});
