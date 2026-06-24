import { districtNestedP } from "schema/geo";
import { prisma } from "#/db";
import { getRoute } from "#/utils";

export const geoDistrictsApi = getRoute("/geo/districts", null, () =>
  prisma.district.findMany(districtNestedP),
);
