import { type FhsFilterT, fhsFilterZ, ftthSurveyS } from "schema/fhs";
import { prisma } from "#/prisma";
import { getRoute } from "#/utils";
import { fhsFilter } from "./filter";

export default getRoute(
  "/fhs",
  () => fhsFilterZ,
  (req) => fhsList(req.query),
);

async function fhsList(input: FhsFilterT) {
  return prisma.ftthSurvey.findMany({
    where: fhsFilter(input),
    select: ftthSurveyS,
    orderBy: [{ createdAt: "desc" }],
    take: input.count || 100,
  });
}
