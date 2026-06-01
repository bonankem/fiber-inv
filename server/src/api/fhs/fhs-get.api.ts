import { ftthSurveyFullS } from "schema/fhs";
import type { UserFullT } from "schema/people";
import { prisma } from "#/prisma";
import { idRoute, notFound } from "#/utils";
import { workAccess } from "../work/filter";

export default idRoute("/fhs/:id", (req) =>
  fhsGet(req.params.id, req.authUser),
);

async function fhsGet(id: string, user: UserFullT) {
  const s = await prisma.ftthSurvey.findUnique({
    where: { id, work: workAccess(user) },
    select: ftthSurveyFullS,
  });
  return s || notFound();
}
