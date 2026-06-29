import { bad, Err } from "schema/errors";
import { type VendorCreateT, vendorCreateZ, vendorS } from "schema/people";
import { prisma } from "#/db";
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
  if (old) bad(Err.ALREADY_EXISTS, old.name);

  return prisma.vendor.create({ data: { key, name }, select: vendorS });
}
