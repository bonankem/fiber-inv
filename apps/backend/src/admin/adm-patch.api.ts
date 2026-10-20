import { bad, Err } from "schema/errors";
import z from "zod";
import { Allow } from "#/auth/guard";
import { prisma, WorkDocType } from "#/db";
import { postRoute } from "#/utils/routing";

export const patchApi = postRoute({
  url: "/admin/patch",
  allow: Allow.PUBLIC,
  schema: z.object({
    commit: z.boolean().optional(),
    param: z.string().optional(),
  }),
  handler: async () => {
    const a = await prisma.workDoc.updateMany({
      where: { type: WorkDocType.AREA_KMZ },
      data: { type: WorkDocType.FHS_AREA_KMZ },
    });
    const items = await prisma.upload.findMany({
      where: { parsed: { path: ["type"], equals: WorkDocType.AREA_KMZ } },
      select: { id: true, parsed: true },
    });
    const parsed = items.map((i) => {
      const parsed = i.parsed;
      if (!parsed) bad(Err.FIELD_REQUIRED);
      parsed.type = WorkDocType.FHS_AREA_KMZ;
      return { ...i, parsed };
    });
    const changes = parsed.map(({ id, parsed }) =>
      prisma.upload.update({
        where: { id },
        data: { parsed },
        select: { id: true, parsed: true },
      }),
    );
    const done = await prisma.$transaction(changes);
    return {
      count: a.count,
      sr: await prisma.workDoc.count({
        where: { type: WorkDocType.SURVEY_REPORT },
      }),
      hs: await prisma.workDoc.count({
        where: { type: WorkDocType.HP_SUMMARY },
      }),
      done,
    };
  },
});
