import { type SecurityT, securityS, securityZ } from "schema/admin";
import { prisma } from "#/db";
import { postRoute } from "#/utils";

export default postRoute(
  "/admin/security",
  () => securityZ,
  (req) => setSecurity(req.body),
);

async function setSecurity(req: SecurityT) {
  return prisma.security.upsert({
    where: { id: "ID" },
    create: req,
    update: req,
    select: securityS,
  });
}
