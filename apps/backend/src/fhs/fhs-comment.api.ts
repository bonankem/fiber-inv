import type { UserT } from "schema/people";
import { type WorkUpdateT, workUpdateZ } from "schema/work";
import { prisma, WorkAction } from "#/db";
import { bad, postRoute } from "#/utils";
import { addLog, update } from "../utils/queries";

export default postRoute(
  "/fhs/comment",
  () => workUpdateZ,
  (req) => fhsComment(req.body, req.authUser),
);

async function fhsComment(body: WorkUpdateT, from: UserT) {
  const { id, comment } = body;
  if (!comment) bad("Comment is required");
  const work = update({ logs: addLog(body, WorkAction.COMMENT, from) });
  return prisma.ftthSurvey.update({ where: { id }, data: { work } });
}
