import { userFullS } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const listApi = getRoute({
  url: "/users",
  handler: listUsers,
});

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { key: "asc" },
    select: userFullS,
  });
}
