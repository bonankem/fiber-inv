import { type FhpFilterT, fhpFilterZ, ftthProjectS } from "schema/fhp";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { workWhere } from "./filter";

export const fhpListApi = getRoute({
  url: "/fhp",
  schema: fhpFilterZ,
  handler: (req) => fhpList(req.query),
});

async function fhpList(input: FhpFilterT) {
  return prisma.ftthProject.findMany({
    where: { work: workWhere(input) },
    select: ftthProjectS,
    orderBy: [{ createdAt: "desc" }],
    take: input.count || 100,
  });
}
