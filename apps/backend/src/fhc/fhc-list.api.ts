import { type FhcFilterT, fhcFilterZ, ftthConnectionS } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { fhcWhere } from "./filter";

export const fhcListApi = getRoute({
  url: "/fhc",
  schema: fhcFilterZ,
  handler: (req) => fhcList(req.query, req.authUser),
});

async function fhcList(input: FhcFilterT, user: UserFullT) {
  return prisma.ftthConnection.findMany({
    where: fhcWhere(input, user),
    select: ftthConnectionS,
    orderBy: { work: { sid: "desc" } },
    take: input.count || 100,
  });
}
