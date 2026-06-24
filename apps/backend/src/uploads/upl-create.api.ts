import type { MultipartFile } from "@fastify/multipart";
import {
  type UploadFullT,
  type UploadOptionsT,
  uploadFullS,
  uploadOptionsZ,
} from "schema/uploads";
import { uuidv7 } from "uuidv7";
import { prisma } from "#/db";
import { appRoute, bad, type Maybe } from "#/utils";
import { maybeParse } from "./parsers";

export const createApi = appRoute(() => ({
  method: "POST",
  url: "/uploads",
  schema: { querystring: uploadOptionsZ },
  handler: async (req) => {
    return createUpload(await req.file(), req.query);
  },
}));

async function createUpload(
  file: Maybe<MultipartFile>,
  query: UploadOptionsT,
): Promise<UploadFullT> {
  if (!file) bad("No file");

  const data = (await file.toBuffer()) as Buffer<ArrayBuffer>;
  const size = data.byteLength;
  const name = file.filename;
  const type = file.mimetype;

  const parsed = await maybeParse({ data, name, type }, query.parser);
  if (typeof parsed === "string") return parsed;

  const id = query.id || (query.noSave ? "" : uuidv7());
  const sentAt = new Date();

  if (query.noSave) {
    return {
      id,
      name,
      size,
      type,
      parsed,
      sentAt,
      madeAt: null,
    };
  }

  return prisma.upload.create({
    data: {
      id,
      name,
      size,
      type,
      sentAt,
      parsed: parsed || undefined,
      inDb: { create: { data } },
    },
    select: uploadFullS,
  });
}
