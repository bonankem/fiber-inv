import { securityS, securityZ } from "schema/admin";
import { prisma } from "#/db";
import { getRoute, postRoute } from "#/utils/routing";

const db = prisma.security;

export const getSecurityApi = getRoute({
  url: "/admin/security",
  handler: () => db.findFirstOrThrow({ select: securityS }),
});

export const setSecurityApi = postRoute({
  url: "/admin/security",
  schema: securityZ,
  handler: (req) => {
    return db.upsert({
      where: { id: "ID" },
      create: req.body,
      update: req.body,
      select: securityS,
    });
  },
});
