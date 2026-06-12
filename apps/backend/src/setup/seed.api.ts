import { hashSync } from "bcryptjs";
import { zFormObject } from "schema/utils";
import z from "zod";
import { MfaMode, type Prisma, prisma, StaffRole } from "#/db";
import { postRoute } from "#/utils";
import { Allow } from "../auth/guard";
import { geoInitialize } from "../geo/geo-initialize.api";
import { create, makeKey } from "../utils/queries";

export default postRoute(
  "/setup/seed",
  () => seedReq,
  (req) => seed(req.body),
  Allow.PUBLIC,
);

export const seedReq = zFormObject("SeedReqT", {
  users: z.array(
    z.strictObject({
      name: z.string(),
      email: z.email(),
      phone: z.string().optional(),
      isAdmin: z.boolean().default(false),
      staffRole: z.enum(StaffRole).optional(),
      vendorName: z.string().optional(),
    }),
  ),
  oems: z.array(z.string()),
  vendors: z.array(z.string()),
  password: z.string(),
});

export type SeedReq = z.infer<typeof seedReq>;

function makeVendor(name: string | undefined) {
  if (!name) return undefined;
  const key = makeKey(name);
  return {
    connectOrCreate: { where: { key }, create: { key, name } },
  } satisfies Prisma.VendorCreateNestedOneWithoutUsersInput;
}

async function seed(req: SeedReq) {
  const hashed = hashSync(req.password);
  const password: Prisma.PasswordCreateNestedOneWithoutUserInput = create({
    hashed,
    history: [hashed],
    mfaMode: MfaMode.UNDECIDED,
    mustChange: true,
  });

  const seedOems = prisma.oem.createMany({
    data: req.oems.map((name) => ({ name, key: makeKey(name) })),
    skipDuplicates: true,
  });

  const seedVendors = prisma.vendor.createMany({
    data: req.vendors.map((name) => ({ name, key: makeKey(name) })),
    skipDuplicates: true,
  });

  const seedUsers = req.users.map((u) => {
    const { vendorName, ...data } = u;
    const vendor = makeVendor(vendorName);
    const key = makeKey(data.name);

    return prisma.user.upsert({
      where: { email: u.email },
      create: { ...data, key, vendor, password },
      update: { ...data, key, vendor },
      select: { id: true, name: true },
    });
  });

  const sampleGeo = await geoInitialize();
  const [{ count: newVendors }, { count: newOems }, ...users] =
    await prisma.$transaction([seedVendors, seedOems, ...seedUsers]);

  await prisma.security.upsert({
    where: { id: "ID" },
    create: {},
    update: {},
  });

  return {
    newVendors,
    newOems,
    users,
    sampleGeo,
  };
}
