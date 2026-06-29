import { bad, Err } from "schema/errors";
import { ftthSurveyFullS } from "schema/fhs";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { idRoute } from "#/utils/routing";
import { workAccess } from "../work/filter";

export const fhsGetApi = idRoute("/fhs/:id", (req) =>
  fhsGet(req.params.id, req.authUser),
);

async function fhsGet(id: string, user: UserFullT) {
  const s = await prisma.ftthSurvey.findUnique({
    where: { id, work: workAccess(user) },
    select: ftthSurveyFullS,
  });
  return s || bad(Err.NOT_FOUND);
}
