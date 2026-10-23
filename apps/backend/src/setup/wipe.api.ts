import dayjs from "dayjs";
import type { PrismaClient, PrismaPromise } from "schema/db/client";
import { bad, Err } from "schema/errors";
import { zFormObject } from "schema/utils";
import z from "zod";
import { prisma } from "#/db";
import { appEnv, isDev } from "#/env";
import { postRoute } from "#/utils/routing";
import { Allow } from "../auth/guard";
import { filterTruthy } from "../utils/queries";

const wipeQueryZ = zFormObject("ResetT", {
  commit: z.boolean().optional(),
  what: z.string(),
  when: z.string(),
  key: z.string(),
});

export const wipeApi = postRoute({
  url: "/setup/wipe",
  schema: wipeQueryZ,
  handler: (req) =>
    wipeDb(
      req.body,
      (req.headers["x-forwarded-host"] as string) || req.hostname,
    ),
  allow: Allow.PUBLIC,
});

type WipeQueryT = z.infer<typeof wipeQueryZ>;

type Deletable = {
  deleteMany(): PrismaPromise<{ count: number }>;
  count(): PrismaPromise<number>;
};
type DelName = {
  [K in keyof PrismaClient]: PrismaClient[K] extends Deletable ? K : never;
}[keyof PrismaClient];

async function wipeDb(q: WipeQueryT, url: string) {
  const key = appEnv.WIPE_KEY;
  if (!key) bad(Err.ACCESS_DENIED, "WIPE_KEY is not set");
  if (q.key !== key) bad(Err.ACCESS_DENIED, "Wrong key");

  const now = dayjs().format("YYYY-MM-DD HH");
  if (!q.when?.startsWith(now)) bad(Err.ACCESS_DENIED, "Wrong time");

  const p = prisma;
  const all = q.what === "all";
  const user = all || /user/.test(q.what);
  const work = all || /work/.test(q.what);
  const cost = all || /cost/.test(q.what);
  const net = all || /net/.test(q.what);
  const geo = all || /geo/.test(q.what);

  const tables = filterTruthy<DelName>([
    work && "ftthConnection",
    work && "ftthProject",
    work && "ftthSurvey",
    work && "work",
    work && "upload",
    net && "fat",
    net && "olt",
    cost && "fhcQuantity",
    cost && "fhcFixedPrice",
    cost && "fhcItemPrice",
    cost && "fhcPbItem",
    geo && "boundary",
    geo && "coords",
    geo && "locality",
    geo && "district",
    user && "user",
    user && "vendor",
    user && "authLog",
  ]);

  if (!q.commit) {
    const counts = await Promise.all(
      tables.map((t) => (p[t] as Deletable).count()),
    );
    const todo = Object.fromEntries(counts.map((c, i) => [tables[i], c]));
    return { commit: false, url, todo };
  }

  if (!isDev && !appEnv.WIPE_ALLOWED_IN_PROD) {
    bad(Err.ACCESS_DENIED);
  }

  const done = await p.$transaction(
    tables.map((t) => (p[t] as Deletable).deleteMany()),
  );
  const results = Object.fromEntries(done.map((r, i) => [tables[i], r.count]));
  return { commit: true, url, results };
}
