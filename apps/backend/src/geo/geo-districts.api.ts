import { districtNestedP } from "schema/geo";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const geoDistrictsApi = getRoute({
  url: "/geo/districts",
  handler: () => prisma.district.findMany(districtNestedP),
});
