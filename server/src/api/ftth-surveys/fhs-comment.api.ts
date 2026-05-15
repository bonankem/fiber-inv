import { type WorkUpdateT, workUpdateZ } from "schema/work";
import { prisma, WorkAction } from "#/prisma";
import { bad, postRoute } from "#/utils";
import { addLog, update } from "../utils/queries";

export default postRoute(
  "/fhs/comment",
  () => workUpdateZ,
  (req) => fhsComment(req.body),
);

async function fhsComment(body: WorkUpdateT) {
  const { id, comment } = body;
  if (!comment) bad("Comment is required");
  const work = update({ logs: addLog(body, WorkAction.COMMENT) });
  return prisma.ftthSurvey.update({ where: { id }, data: { work } });
}
