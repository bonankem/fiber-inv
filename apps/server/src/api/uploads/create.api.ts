import type { MultipartFile } from "@fastify/multipart";
import { uuidv7 } from "uuidv7";
import z from "zod";
import { prisma, WorkDocType } from "#/prisma";
import { appRoute, bad, type Maybe } from "#/utils";
import { maybeParse } from "./parsers";

const uploadQueryZ = z.strictObject({
  id: z.uuidv7().optional(),
  parser: z.enum(WorkDocType).optional(),
  noSave: z.coerce.boolean().default(false),
});

type UploadQueryT = z.infer<typeof uploadQueryZ>;

export default appRoute(() => ({
  method: "POST",
  url: "/uploads",
  schema: {
    querystring: uploadQueryZ,
  },
  handler: async (req) => {
    return createUpload(await req.file(), req.query);
  },
}));

async function createUpload(file: Maybe<MultipartFile>, query: UploadQueryT) {
  if (!file) bad("No file");

  const data = (await file.toBuffer()) as Buffer<ArrayBuffer>;
  const size = data.byteLength;
  const name = file.filename;
  const type = file.mimetype;

  const parsed = await maybeParse({ data, name, type }, query.parser);
  if (typeof parsed === "string") return parsed;

  if (query.noSave) {
    const id = query.id ?? "";
    return { id, name, size, type, parsed };
  }

  const id = query.id || uuidv7();
  const sentAt = new Date();

  return prisma.upload.create({
    data: {
      id,
      name,
      size,
      type,
      sentAt,
      parsed,
      inDb: { create: { data } },
    },
    select: {
      id: true,
      name: true,
      size: true,
      type: true,
      parsed: true,
    },
  });
}
