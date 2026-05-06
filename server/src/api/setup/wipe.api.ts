import type { PrismaPromise } from "@prisma/client/runtime/client";
import { zFormObject } from "schema/utils";
import z from "zod";
import { prisma } from "#/prisma";
import { postRoute } from "#/utils";
import { filterTruthy } from "../utils/queries";

export default postRoute(
  "/setup/wipe",
  () => queryZ,
  (req) => wipeDb(req.body),
);

const queryZ = zFormObject("ResetT", {
  commit: z.boolean().optional(),
  fully: z.boolean().optional(),
}).nullable();

type QueryT = z.infer<typeof queryZ>;
type Deletable = { deleteMany(): PrismaPromise<{ count: number }> };

async function wipeDb(q: QueryT) {
  if (!q?.commit) return { commit: false };

  const p = prisma;
  const tables: Deletable[] = filterTruthy([
    p.ftthConnection,
    p.ftthProject,
    p.ftthSurvey,
    p.work,
    p.upload,
    p.ont,
    p.fat,
    p.hub,
    p.olt,
    p.plaque,
    p.boundary,
    p.coords,
    p.city,
    p.district,
    q.fully && p.user,
    q.fully && p.vendor,
  ]);

  const results = await p.$transaction(tables.map((t) => t.deleteMany()));
  return results.map((r) => r.count);
}
