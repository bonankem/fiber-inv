import { bad, Err } from "schema/errors";
import {
  fhcAddCostConditionsZ,
  fhcAddCostLinesZ,
  fhcCostConditionListP,
  fhcCostLineListP,
} from "schema/fhc";
import { prisma } from "#/db";
import { appPlugin, getRoute, postRoute } from "#/utils/routing";

export const fhcCostApi = appPlugin((app) => {
  app.register(fhcCostConditionsGetApi);
  app.register(fhcCostConditionsAddApi);
  app.register(fhcCostLinesGetApi);
  app.register(fhcCostLinesAddApi);
});

const condDb = prisma.fhcCostCondition;
const lineDb = prisma.fhcCostLine;

const fhcCostConditionsGetApi = getRoute({
  url: "/fhc/cost-conditions",
  handler: () => condDb.findMany(fhcCostConditionListP),
});

const fhcCostLinesGetApi = getRoute({
  url: "/fhc/cost-lines",
  handler: () => lineDb.findMany(fhcCostLineListP),
});

const fhcCostConditionsAddApi = postRoute({
  url: "/fhc/cost-conditions",
  schema: fhcAddCostConditionsZ,
  handler: async (req) => {
    const data = req.body.items;
    const done = await condDb.createMany({ data, skipDuplicates: true });
    const created = done.count;
    const skipped = data.length - created;
    return { created, skipped };
  },
});

const fhcCostLinesAddApi = postRoute({
  url: "/fhc/cost-lines",
  schema: fhcAddCostLinesZ,
  handler: async (req) => {
    const lastLine = await lineDb.findFirst({ orderBy: { ord: "desc" } });
    const lastOrd = lastLine?.ord || 0;
    const data = req.body.items;

    const done = await lineDb.createMany({
      data: data.map((l, i) => ({
        ref: l.ref,
        ord: lastOrd + i + 1,
        nameEn: l.nameEn || l.nameFr || bad(Err.FIELD_REQUIRED, "nameEn"),
        nameFr: l.nameFr || l.nameEn || bad(Err.FIELD_REQUIRED, "nameFr"),
        conditionId: l.conditionId,
      })),
    });
    const created = done.count;
    const skipped = data.length - created;
    return { created, skipped };
  },
});
