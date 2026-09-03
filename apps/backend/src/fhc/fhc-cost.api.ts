import { fhcCostS } from "schema/fhc";
import { prisma } from "#/db";
import { idRoute } from "#/utils/routing";

const db = prisma.ftthConnection;

export const fhcCostGetApi = idRoute("/fhc/:id/cost", async (req) =>
  db.findUniqueOrThrow({ where: { id: req.params.id }, select: fhcCostS }),
);
