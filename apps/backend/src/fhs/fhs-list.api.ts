import { type FhsFilterT, fhsFilterZ, ftthSurveyS } from "schema/fhs";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { fhsWorkWhere } from "./filter";

export const fhsListApi = getRoute({
  url: "/fhs",
  schema: fhsFilterZ,
  handler: (req) => fhsList(req.query, req.authUser),
});

async function fhsList(input: FhsFilterT, user: UserFullT) {
  return prisma.ftthSurvey.findMany({
    where: { work: fhsWorkWhere(input, user) },
    select: ftthSurveyS,
    orderBy: [{ createdAt: "desc" }],
    take: input.count || 100,
  });
}
