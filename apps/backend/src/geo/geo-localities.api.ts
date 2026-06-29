import { idNameP } from "schema/common";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const geoLocalitiesApi = getRoute({
  url: "/geo/localities",
  handler: () => prisma.locality.findMany(idNameP),
});
