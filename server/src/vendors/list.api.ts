import { vendorS } from "schema/people";
import { prisma } from "#/prisma";
import { getRoute } from "#/utils";

export default getRoute("/vendors", null, () => listVendors());

async function listVendors() {
  return prisma.vendor.findMany({ select: vendorS, orderBy: { key: "asc" } });
}
