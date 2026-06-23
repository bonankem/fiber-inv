import { securityS, securityZ } from "schema/admin";
import { prisma } from "#/db";
import { getRoute, postRoute } from "#/utils";

const db = prisma.security;

export const getSecurityApi = getRoute("/admin/security", null, () =>
  db.findFirstOrThrow({ select: securityS }),
);

export const setSecurityApi = postRoute(
  "/admin/security",
  () => securityZ,
  (req) => {
    return db.upsert({
      where: { id: "ID" },
      create: req.body,
      update: req.body,
      select: securityS,
    });
  },
);
