import { securityS } from "schema/admin";
import { prisma } from "#/db";
import { getRoute } from "#/utils";

export default getRoute("/admin/security", null, () => getSecurity());

async function getSecurity() {
  return prisma.security.findFirstOrThrow({ select: securityS });
}
