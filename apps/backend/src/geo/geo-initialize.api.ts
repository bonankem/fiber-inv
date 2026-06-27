import { idKeyNameS } from "schema/common";
import { assoc } from "schema/utils";
import { prisma } from "#/db";
import { bad } from "#/utils/errors";
import { postRoute } from "#/utils/routing";
import { makeKey } from "../utils/queries";
import polygons from "./geo.json" with { type: "json" };
import { geoNames } from "./geo.names";
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
    bad(`No polygon for ${missing.join(", ")}`);
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

  const makeLocalities = geoNames.flatMap((g) => {
    const dKey = makeKey(g.name);
    return g.list.map((name) => {
      const key = makeKey(name);
      const bnd = boundaries[key] || bad(`No polygon for ${name}`);
      return prisma.locality.upsert({
        where: { key },
        update: {
          boundary: { upsert: { update: bnd, create: bnd } },
          name,
          key,
        },
        create: {
          district: { connect: { key: dKey } },
          boundary: { create: bnd },
          name,
          key,
        },
        select: idKeyNameS,
      });
    });
  });

  await prisma.$transaction([...makeDistricts, ...makeLocalities]);

  return prisma.locality.findFirst({
    select: { id: true, key: true, name: true, boundary: true },
  });
}
