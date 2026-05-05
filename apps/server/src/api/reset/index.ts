import { zFormObject } from "schema/utils";
import z from "zod";
import { prisma } from "#/prisma";
import { type Maybe, postRoute } from "#/utils";

const queryZ = zFormObject("ResetT", {
  commit: z.boolean().optional(),
});
export default postRoute(
  "/reset",
  () => queryZ,
  (req) => reset(req.body.commit),
);

async function reset(commit: Maybe<boolean>) {
  if (!commit) return { commit: false };

  const p = prisma;
  return p.$transaction([
    p.ftthConnection.deleteMany(),
    p.ftthProject.deleteMany(),
    p.ftthSurvey.deleteMany(),
    p.work.deleteMany(),
    p.upload.deleteMany(),
  ]);
}
