import type { PrismaPromise } from "@prisma/client/runtime/client";
import { zFormObject } from "schema/utils";
import z from "zod";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { Allow } from "../auth/guard";
import { filterTruthy } from "../utils/queries";

const wipeQueryZ = zFormObject("ResetT", {
  commit: z.boolean().optional(),
  fully: z.boolean().optional(),
}).nullable();

export const wipeApi = postRoute({
  url: "/setup/wipe",
  schema: wipeQueryZ,
  handler: (req) => wipeDb(req.body),
  allow: Allow.PUBLIC,
});

type WipeQueryT = z.infer<typeof wipeQueryZ>;

type Deletable = { deleteMany(): PrismaPromise<{ count: number }> };

async function wipeDb(q: WipeQueryT) {
  if (!q?.commit) return { commit: false };

  const p = prisma;
  const tables: Deletable[] = filterTruthy([
    p.ftthConnection,
    p.ftthProject,
    p.ftthSurvey,
    p.work,
    p.upload,
    p.ont,
    p.ftthArea,
    p.ftthBox,
    p.boundary,
    p.olt,
    p.coords,
    p.locality,
    p.district,
    q.fully && p.user,
    q.fully && p.vendor,
    q.fully && p.authLog,
  ]);

  const results = await p.$transaction(tables.map((t) => t.deleteMany()));
  return results.map((r) => r.count);
}
