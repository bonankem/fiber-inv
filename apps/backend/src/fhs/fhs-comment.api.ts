import { mustHaveFields } from "schema/errors";
import type { UserT } from "schema/people";
import { type WorkUpdateT, workUpdateZ } from "schema/work";
import { prisma, WorkAction } from "#/db";
import { postRoute } from "#/utils/routing";
import { addLog, update } from "../utils/queries";

export const fhsCommentApi = postRoute({
  url: "/fhs/comment",
  schema: workUpdateZ,
  handler: (req) => fhsComment(req.body, req.authUser),
});

async function fhsComment(body: WorkUpdateT, from: UserT) {
  mustHaveFields(body, "comment");
  const { id } = body;
  const work = update({ logs: addLog(body, WorkAction.COMMENT, from) });
  return prisma.ftthSurvey.update({ where: { id }, data: { work } });
}
