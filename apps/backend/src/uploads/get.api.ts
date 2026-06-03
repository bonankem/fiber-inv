import z from "zod";
import { prisma } from "#/db";
import { type AppReply, appRoute, notFound } from "#/utils";

const paramsZ = z.strictObject({
  id: z.string(),
  name: z.string(),
});

export default appRoute(() => ({
  url: "/uploads/:id/:name",
  method: "GET",
  schema: { params: paramsZ },
  handler(req, reply) {
    return getUpload(req.params.id, reply);
  },
}));

async function getUpload(id: string, reply: AppReply) {
  const up = await prisma.uploadInDb.findUnique({
    where: { uploadId: id },
    select: { data: true, upload: true },
  });
  if (!up) notFound();

  const { name, type } = up.upload;
  const canBeInline = /^image\/|\/pdf$/i.test(type);
  const mode = canBeInline ? "inline" : "attachment";
  const disp = `${mode}; filename="${name}"`;
  reply.type(up.upload.type).header("content-disposition", disp).send(up.data);
}
