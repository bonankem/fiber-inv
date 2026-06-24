import { userS } from "schema/people";
import { prisma } from "#/db";
import { idRoute } from "#/utils";

export const getApi = idRoute("/users/:id", (req) => getUser(req.params.id));

export async function getUser(id: string) {
  return prisma.user.findFirstOrThrow({ where: { id }, select: userS });
}
