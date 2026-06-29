import { bad, Err } from "schema/errors";
import z from "zod";
import { prisma } from "#/db";
import { appRoute, rbac } from "#/utils/routing";
import { Allow } from "../auth/guard";

const paramsZ = z.strictObject({
  id: z.string(),
  name: z.string(),
});

export const downloadApi = appRoute({
  url: "/download/:id/:name",
  method: "GET",
  schema: { params: paramsZ },
  onRequest: rbac(Allow.PUBLIC),
  handler: async (req, reply) => {
    const up = await prisma.upload.findUnique({
      where: { id: req.params.id },
      include: { inDb: true },
    });
    if (!up?.inDb) bad(Err.NOT_FOUND);

    const inline = /^image\/|\/pdf$/.test(up.type);
    const disp = inline ? "inline" : "attachment";
    reply.header("content-disposition", `${disp}; filename=${up.name}`);
    return reply.type(up.type).send(up.inDb.data);
  },
});
