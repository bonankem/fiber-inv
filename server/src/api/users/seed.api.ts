import { hashSync } from "bcryptjs";
import z from "zod";
import { MfaMode, type Prisma, prisma, StaffRole } from "#/prisma";
import { appRoute } from "#/utils";

export default appRoute(() => ({
  method: "POST",
  url: "/users/seed",
  schema: { body: seedReq },
  handler: (req) => seed(req.body),
}));

export const seedReq = z.strictObject({
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
  password: z.string(),
});

export type SeedReq = z.infer<typeof seedReq>;

type MakePassword = Prisma.PasswordCreateNestedOneWithoutUserInput | undefined;

type MakeVendor = Prisma.VendorCreateNestedOneWithoutUsersInput | undefined;

function makeVendor(name: string | undefined): MakeVendor {
  if (!name) return undefined;
  const key = name?.toLowerCase();
  return { connectOrCreate: { where: { key }, create: { key, name } } };
}

export async function seed(req: SeedReq) {
  const hashed = hashSync(req.password);
  const password: MakePassword = {
    create: {
      hashed,
      history: [hashed],
      mfaMode: MfaMode.NONE,
      mustChange: false,
    },
  };

  const queries = req.users.map((u) => {
    const { vendorName, ...data } = u;
    const vendor = makeVendor(vendorName);
    const key = data.name.toLowerCase();

    return prisma.user.upsert({
      where: { email: u.email },
      create: { ...data, key, password, vendor },
      update: { ...data, key, vendor },
    });
  });

  return prisma.$transaction(queries);
}
