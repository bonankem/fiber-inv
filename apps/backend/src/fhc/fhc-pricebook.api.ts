import { countBy } from "remeda";
import { OnConflict } from "schema/common";
import { bad, Err } from "schema/errors";
import { type FhcPbUpdateT, fhcPbLineListP, fhcPbUpdateZ } from "schema/fhc";
import { filterTruthy } from "schema/utils";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { getRoute, postRoute } from "#/utils/routing";

const db = prisma.fhcPbLine;

export const fhcPbListApi = getRoute({
  url: "/fhc/pricebook",
  handler: () => db.findMany(fhcPbLineListP),
});

export const fhcPbUpdateApi = postRoute({
  url: "/fhc/pricebook",
  allow: Allow.ADMIN,
  schema: fhcPbUpdateZ,
  handler: (req) => fhcPbUpdate(req.body),
});

export const fhcPbDeleteApi = postRoute({
  url: "/fhc/pricebook",
  allow: Allow.ADMIN,
  method: "DELETE",
  handler: () => db.deleteMany(),
});

async function fhcPbUpdate(req: FhcPbUpdateT) {
  const { items, onConflict: c } = req;
  const older = await db.findMany({});
  const oldRefs = new Set(older.map((item) => item.ref));
  const byNameEn = {} as Record<string, string>;
  const byNameFr = {} as Record<string, string>;

  const counts = countBy(items, (i) => i.ref);
  for (const [ref, count] of Object.entries(counts)) {
    if (count > 1) bad(Err.DUPLICATE_ENTRY, ref);
  }

  const actions = items.map(({ ref, nameEn, nameFr }) => {
    const old = oldRefs.has(ref);
    if (old) {
      if (c === OnConflict.SKIP) return null;
      else if (c === OnConflict.FAIL) bad(Err.ALREADY_EXISTS, ref);
    }
    nameEn = nameEn || nameFr || bad(Err.FIELD_REQUIRED, "nameEn");
    nameFr = nameEn || nameFr || bad(Err.FIELD_REQUIRED, "nameFr");
    nameEn = nameEn.trim().replace(/ +/g, " ");
    nameFr = nameFr.trim().replace(/ +/g, " ");

    const clash = byNameEn[nameEn] || byNameFr[nameFr];
    if (clash) bad(Err.DUPLICATE_ENTRY, `${clash} / ${ref}`);
    byNameEn[nameEn] = ref;
    byNameFr[nameFr] = ref;

    return db.upsert({
      where: { ref },
      update: { nameEn, nameFr },
      create: { nameEn, nameFr, ref },
    });
  });

  return prisma.$transaction(filterTruthy(actions));
}
