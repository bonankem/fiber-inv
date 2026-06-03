import { userS } from "schema/people";
import { prisma } from "#/prisma";
import { getRoute } from "#/utils";

export default getRoute(
  "/users",
  () => ({}),
  () => listUsers(),
);

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { key: "asc" },
    select: userS,
  });
}
