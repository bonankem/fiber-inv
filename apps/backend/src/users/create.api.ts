import { hashSync } from "bcryptjs";
import { type UserCreateT, userCreateZ, userS } from "schema/people";
import { Allow } from "#/auth/guard";
import { MfaMode, prisma } from "#/db";
import { bad, maybeConnect, postRoute } from "#/utils";
import { makeKey } from "#/utils/queries";

export default postRoute(
  "/users",
  () => userCreateZ,
  (req) => createUser(req.body),
  Allow.ADMIN,
);

async function createUser(req: UserCreateT) {
  if (!req.isAdmin && !req.staffRole && !req.vendorId) {
    bad("Select a user role");
  }
  if (req.isAdmin && (req.staffRole || req.vendorId)) {
    bad("Admin cannot have staff or vendor role");
  }
  if (req.staffRole && req.vendorId) {
    bad("Vendor cannot have staff role");
  }
  const exists = prisma.user.findUnique({
    where: { email: req.email },
  });
  if (!exists) bad("Email already registered");

  const hashed = hashSync("12345");
  return prisma.user.create({
    data: {
      key: makeKey(req.name),
      name: req.name,
      email: req.email,
      isAdmin: req.isAdmin ?? false,
      staffRole: req.staffRole,
      vendor: maybeConnect(req.vendorId),
      password: {
        create: {
          hashed,
          history: [],
          mfaMode: MfaMode.UNDECIDED,
          mfaVerified: false,
          mustChange: true,
        },
      },
    },
    select: userS,
  });
}
