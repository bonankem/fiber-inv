import { workDocP } from "schema/work";
import { prisma } from "#/db";
import { idRoute } from "#/utils";

export default idRoute("/work/:id/docs", (req) => workDocs(req.params.id));

async function workDocs(id: string) {
  return prisma.workDoc.findMany({
    where: { workId: id },
    ...workDocP,
  });
}
