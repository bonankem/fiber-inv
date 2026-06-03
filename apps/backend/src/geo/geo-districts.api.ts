import { districtNestedP } from "schema/geo";
import { prisma } from "#/db";
import { getRoute } from "#/utils";

export default getRoute("/geo/districts", null, () => listDistricts());

async function listDistricts() {
  return prisma.district.findMany(districtNestedP);
}
