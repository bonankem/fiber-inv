import type { PrismaPromise } from "@prisma/client/runtime/client";
import type { PrismaClient } from "schema/db/client";
import { zFormObject } from "schema/utils";
import z from "zod";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { Allow } from "../auth/guard";
import { filterTruthy } from "../utils/queries";

const wipeQueryZ = zFormObject("ResetT", {
  commit: z.boolean().optional(),
  what: z.string(),
}).nullable();

export const wipeApi = postRoute({
  url: "/setup/wipe",
  schema: wipeQueryZ,
  handler: (req) => wipeDb(req.body),
  allow: Allow.PUBLIC,
});

type WipeQueryT = z.infer<typeof wipeQueryZ>;

type Deletable = { deleteMany(): PrismaPromise<{ count: number }> };
type DelName = {
  [K in keyof PrismaClient]: PrismaClient[K] extends Deletable ? K : never;
}[keyof PrismaClient];

async function wipeDb(q: WipeQueryT) {
  if (!q?.commit) return { commit: false };

  const p = prisma;
  const user = /user/.test(q.what);
  const work = /work/.test(q.what);
  const net = /net/.test(q.what);
  const geo = /geo/.test(q.what);

  const tables = filterTruthy<DelName>([
    work && "ftthConnection",
    work && "ftthProject",
    work && "ftthSurvey",
    work && "work",
    work && "upload",
    net && "ftthBox",
    net && "olt",
    geo && "boundary",
    geo && "coords",
    geo && "locality",
    geo && "district",
    user && "user",
    user && "vendor",
    user && "authLog",
  ]);

  const results = await p.$transaction(
    tables.map((t) => (p[t] as Deletable).deleteMany()),
  );
  return Object.fromEntries(results.map((r, i) => [tables[i], r.count]));
}
