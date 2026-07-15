import { idKeyNameS } from "schema/common";
import { assoc } from "schema/utils";
import { prisma } from "#/db";
import { fatal } from "#/utils/errors";
import { postRoute } from "#/utils/routing";
import { makeKey } from "../utils/queries";
import polygons from "./geo.json" with { type: "json" };
import { geoAbbrs, geoNames } from "./geo.names";
import { ringWithBbox } from "./utils";

export const geoInitializeApi = postRoute({
  url: "/geo/initialize",
  handler: () => geoInitialize(),
});

export async function geoInitialize() {
  const boundaries = assoc(
    polygons.features,
    (f) => makeKey(f.properties.name),
    (f) => {
      const ring = f.geometry.coordinates[0];
      return ringWithBbox(ring.map(([lng, lat]) => ({ lat, lng })));
    },
  );

  const depts = geoNames.flatMap((g) => g.list);

  const missing: string[] = [];
  for (const d of depts) {
    if (!boundaries[makeKey(d)]) missing.push(d);
  }
  if (missing.length > 0) {
    fatal(`No polygon for ${missing.join(", ")}`);
  }

  const deptSet = new Set(depts.map(makeKey));
  for (const key in boundaries) {
    if (!deptSet.has(key)) missing.push(key);
  }

  const makeDistricts = geoNames.map(({ name }) => {
    const key = makeKey(name);
    return prisma.district.upsert({
      where: { key },
      update: { name },
      create: { name, key },
      select: idKeyNameS,
    });
  });

  const noAbbr: string[] = [];

  const makeLocalities = geoNames.flatMap((g) => {
    const dKey = makeKey(g.name);
    return g.list.map((name) => {
      const key = makeKey(name);
      const bnd = boundaries[key] || fatal(`No polygon for ${name}`);
      const abbr = geoAbbrs[key];
      if (key && !abbr) noAbbr.push(key);

      return prisma.locality.upsert({
        where: { key },
        update: {
          boundary: { upsert: { update: bnd, create: bnd } },
          name,
          abbr,
          key,
        },
        create: {
          district: { connect: { key: dKey } },
          boundary: { create: bnd },
          name,
          abbr,
          key,
        },
        select: idKeyNameS,
      });
    });
  });

  await prisma.$transaction([...makeDistricts, ...makeLocalities]);

  const loc = await prisma.locality.findFirst({
    select: {
      id: true,
      key: true,
      abbr: true,
      name: true,
      boundary: true,
    },
  });
  noAbbr.sort();
  return { loc, noAbbr };
}
