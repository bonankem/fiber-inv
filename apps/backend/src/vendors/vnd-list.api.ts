import { vendorS } from "schema/people";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";

export const listApi = getRoute({
  url: "/vendors",
  handler: () => listVendors(),
});

async function listVendors() {
  return prisma.vendor.findMany({ select: vendorS, orderBy: { key: "asc" } });
}
