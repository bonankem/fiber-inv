import { userFullS } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils";

export const listApi = getRoute(
  "/users",
  () => ({}),
  () => listUsers(),
);

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { key: "asc" },
    select: userFullS,
  });
}
