import { prisma } from "#/prisma";
import { getRoute } from "#/utils";

export default getRoute(
  "/uploads",
  () => {},
  () => {
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
  },
);
