import z from "zod";
import { type Prisma, prisma } from "#/db";
import { postRoute } from "#/utils/routing";

const cleanupReqZ = z.strictObject({
  ids: z.array(z.uuid()),
});

export const cleanupApi = postRoute({
  url: "/uploads/cleanup",
  schema: cleanupReqZ,
  handler: (req) => cleanupUploads(req.body.ids),
});

type WhereId = Pick<Prisma.UploadWhereInput, "id">;
// one-to-one relations are filtered with null rather than { none }
type OneRelFields = "fiberSource";
type AllRelFields = Exclude<
  keyof Prisma.UploadInclude,
  "inDb" | "_count" | OneRelFields
>;
type AllRelations = WhereId & { [K in AllRelFields]: { none: object } } & {
  [K in OneRelFields]: null;
};

async function cleanupUploads(ids: string[]) {
  return prisma.upload.deleteMany({
    where: {
      id: { in: ids },
      workDocs: { none: {} },
      workLogs: { none: {} },
      emrfLogs: { none: {} },
      fiberSource: null,
    } satisfies AllRelations,
  });
}
