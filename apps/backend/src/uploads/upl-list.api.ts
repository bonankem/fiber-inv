import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const listApi = getRoute({
  url: "/uploads",
  handler: () =>
    prisma.upload.findMany({
      orderBy: { sentAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
      },
    }),
});
