import { randomBytes } from "node:crypto";
import { hashSync } from "bcryptjs";
import { bad, Err } from "schema/errors";
import { type UserCreateT, userCreateZ, userS } from "schema/people";
import { authLog } from "#/admin/adm-syslog.api";
import { Allow } from "#/auth/guard";
import { AuthAction, MfaMode, prisma } from "#/db";
import { isDev } from "#/env";
import { sendMail } from "#/mail";
import { maybeConnect } from "#/utils/ids";
import { makeKey } from "#/utils/queries";
import { postRoute, type RequestWith } from "#/utils/routing";

export const createApi = postRoute({
  url: "/users",
  schema: userCreateZ,
  handler: createUser,
  allow: Allow.ADMIN,
});

async function createUser(req: RequestWith<UserCreateT>) {
  const { name, email, isAdmin, staffRole, vendorId } = req.body;

  if (!isAdmin && !staffRole && !vendorId) {
    bad(Err.FIELD_REQUIRED, "role");
  }
  if (isAdmin && (staffRole || vendorId)) {
    bad(Err.ADMIN_CANNOT_HAVE_ROLE);
  }
  if (staffRole && vendorId) {
    bad(Err.VENDOR_CANNOT_BE_STAFF);
  }
  const exists = prisma.user.findUnique({ where: { email } });
  if (!exists) bad(Err.ALREADY_EXISTS, email);

  const password = randomBytes(9).toString("base64");
  const hashed = hashSync(password);
  if (isDev) console.log(password);

  const user = await prisma.user.create({
    data: {
      key: makeKey(name),
      name,
      email: email,
      isAdmin: isAdmin,
      staffRole: staffRole,
      vendor: maybeConnect(vendorId),
      password: {
        create: {
          hashed,
          history: [hashed],
          mfaMode: MfaMode.UNDECIDED,
          mfaVerified: false,
          mustChange: true,
        },
      },
    },
    select: userS,
  });

  await authLog(AuthAction.ADD_USER, req, user.email);

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
    button: "/",
  });

  return user;
}
