import { randomBytes } from "node:crypto";
import { hashSync } from "bcryptjs";
import { type UserCreateT, userCreateZ, userS } from "schema/people";
import { Allow } from "#/auth/guard";
import { MfaMode, prisma } from "#/db";
import { isDev } from "#/env";
import { sendMail } from "#/mail";
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

  const password = randomBytes(9).toString("base64");
  const hashed = hashSync(password);
  if (isDev) console.log(password);

  const user = await prisma.user.create({
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

  sendMail({
    subject: "Welcome to ServiceX",
    to: [user.email],
    lines: [
      "An account has been created for you on MTNCI ServiceX.",
      "Your login details are shown below. You will need to change you password after logging in.",
    ],
    fields: [
      ["Name", user.name],
      ["Email", user.email],
      ["Password", password],
    ],
  });

  return user;
}
