import { idKeyNameS } from "schema/common";
import { multiPolygonFromGeoJson } from "schema/geo";
import { assoc } from "schema/utils";
import { prisma } from "#/prisma";
import { bad, postRoute } from "#/utils";
import { makeKey } from "../utils/queries";
import polygons from "./geo.json";
import { geoNames } from "./geo.names";
import { getBoundingBox } from "./utils";

export default postRoute("/geo/initialize", null, () => geoInitialize());

export async function geoInitialize() {
  const boundaries = assoc(
    polygons.features,
    (f) => makeKey(f.properties.name),
    (f) => {
      const p = multiPolygonFromGeoJson(f.geometry.coordinates);
      const b = getBoundingBox(p);
      return { multiPolygon: p, boxN: b.n, boxE: b.e, boxW: b.w, boxS: b.s };
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
