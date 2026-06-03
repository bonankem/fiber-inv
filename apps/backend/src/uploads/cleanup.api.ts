import z from "zod";
import { prisma } from "#/db";
import { postRoute } from "#/utils";

export default postRoute(
  "/uploads/cleanup",
  () => cleanupReqZ,
  (req) => cleanupUploads(req.body.ids),
);

const cleanupReqZ = z.strictObject({
  ids: z.array(z.uuid()),
});

async function cleanupUploads(ids: string[]) {
  return prisma.upload.deleteMany({
    where: {
      id: { in: ids },
      workDocs: { none: {} },
      workLogs: { none: {} },
    },
  });
}
