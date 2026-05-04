import { districtNestedP } from "schema/geo";
import { prisma } from "#/prisma";
import { getRoute } from "#/utils";

export default getRoute("/geo/districts", null, () => listDistricts());

async function listDistricts() {
  return prisma.district.findMany(districtNestedP);
}
