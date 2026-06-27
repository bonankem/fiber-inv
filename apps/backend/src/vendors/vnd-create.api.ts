import { type VendorCreateT, vendorCreateZ, vendorS } from "schema/people";
import { prisma } from "#/db";
import { bad } from "#/utils/errors";
import { postRoute } from "#/utils/routing";
import { makeKey } from "../utils/queries";

export const createApi = postRoute({
  url: "/vendors",
  schema: vendorCreateZ,
  handler: (req) => createVendor(req.body),
});

async function createVendor({ name }: VendorCreateT) {
  const key = makeKey(name);

  const old = await prisma.vendor.findUnique({ where: { key } });
  if (old) bad(`Vendor already exists: ${old.name}`);

  return prisma.vendor.create({ data: { key, name }, select: vendorS });
}
