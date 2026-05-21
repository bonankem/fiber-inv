import { type FhsFilterT, fhsFilterZ, ftthSurveyS } from "schema/fhs";
import { prisma } from "#/prisma";
import { getRoute } from "#/utils";
import { fhsWorkWhere } from "./filter";

export default getRoute(
  "/fhs",
  () => fhsFilterZ,
  (req) => fhsList(req.query),
);

async function fhsList(input: FhsFilterT) {
  return prisma.ftthSurvey.findMany({
    where: { work: fhsWorkWhere(input) },
    select: ftthSurveyS,
    orderBy: [{ createdAt: "desc" }],
    take: input.count || 100,
  });
}
