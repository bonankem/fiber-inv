import { vendorS } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils";

export const listApi = getRoute("/vendors", null, () => listVendors());

async function listVendors() {
  return prisma.vendor.findMany({ select: vendorS, orderBy: { key: "asc" } });
}
