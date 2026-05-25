import { ftthSurveyS } from "schema/fhs";
import { prisma } from "#/prisma";
import { idRoute, notFound } from "#/utils";

export default idRoute("/fhs/:id", (req) => fhsGet(req.params.id));

async function fhsGet(id: string) {
  const s = await prisma.ftthSurvey.findUnique({
    where: { id },
    select: ftthSurveyS,
  });
  return s || notFound();
}
