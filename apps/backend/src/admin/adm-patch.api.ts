import { bad, Err } from "schema/errors";
import z from "zod";
import { Allow } from "#/auth/guard";
import { type Prisma, prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const patchApi = postRoute({
  url: "/admin/patch",
  allow: Allow.PUBLIC,
  schema: z.object({
    commit: z.boolean().optional(),
    param: z.string().optional(),
  }),
  handler: async (req) => {
    const name = req.body.param;
    if (!name) bad(Err.FIELD_REQUIRED, "param");

    const where: Prisma.WorkLogWhereInput = {
      action: "REQUEST",
      fromUser: { name },
    };
    const works = await prisma.work.findMany({
      where: { logs: { some: where } },
      select: {
        id: true,
        sid: true,
        logs: { select: { id: true } },
        docs: { select: { id: true } },
      },
    });
    const sids = works.map((work) => work.sid);
    const logIds = works.flatMap((work) => work.logs.map((log) => log.id));
    const docIds = works.flatMap((work) => work.docs.map((doc) => doc.id));
    const workIds = works.map((work) => work.id);
    const count = works.length;
    if (!req.body.commit) {
      return { commit: false, count, sids, logIds, docIds, workIds };
    }

    const result = await prisma.$transaction([
      prisma.workDoc.deleteMany({ where: { id: { in: docIds } } }),
      prisma.workLog.deleteMany({ where: { id: { in: logIds } } }),
      prisma.upload.deleteMany({
        where: {
          workDocs: { every: { id: { in: docIds } } },
          workLogs: { every: { id: { in: logIds } } },
        },
      }),
      prisma.ftthSurvey.deleteMany({ where: { id: { in: workIds } } }),
      prisma.ftthProject.deleteMany({ where: { id: { in: workIds } } }),
      prisma.ftthConnection.deleteMany({ where: { id: { in: workIds } } }),
      prisma.work.deleteMany({ where: { id: { in: workIds } } }),
    ]);
    const counts = result.map((r) => r.count).reverse();
    return { commit: true, counts, sids };
  },
});
