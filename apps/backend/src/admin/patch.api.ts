import dayjs from "dayjs";
import { prisma } from "#/db";
import { postRoute } from "#/utils";

export const patchApi = postRoute("/admin/patch", null, patch);

async function patch() {
  const deleted = await prisma.user.deleteMany({
    where: { email: "patrice.tano@mtn.com" },
  });

  const reset = await prisma.user.update({
    where: { email: "leo@zoracom.com" },
    data: {
      authenticator: { delete: true },
      password: { update: { mfaMode: "UNDECIDED" } },
    },
  });

  const updated = await prisma.user.updateMany({
    where: { email: "leo@zoracom.com" },
    data: { lastActive: new Date() },
  });

  const users = await prisma.user.findMany({
    where: { lastActive: null },
  });
  const changes = users.map((u) => {
    const expiredAt = dayjs(u.createdAt).add(1, "days").toDate();
    return prisma.user.update({
      where: { id: u.id },
      data: { expiredAt },
    });
  });
  const expired = await prisma.$transaction(changes);
  return { deleted, updated, reset, expired };
}
