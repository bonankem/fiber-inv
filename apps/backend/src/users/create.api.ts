import { randomBytes } from "node:crypto";
import { hashSync } from "bcryptjs";
import { type UserCreateT, userCreateZ, userS } from "schema/people";
import { sendSyslog } from "#/admin/syslog";
import { Allow } from "#/auth/guard";
import { AuthAction, MfaMode, prisma } from "#/db";
import { isDev } from "#/env";
import { sendMail } from "#/mail";
import { type AnyRequest, bad, maybeConnect, postRoute } from "#/utils";
import { makeKey } from "#/utils/queries";

export default postRoute(
  "/users",
  () => userCreateZ,
  (req) => createUser(req),
  Allow.ADMIN,
);

type Req = AnyRequest & {
  body: UserCreateT;
};

async function createUser(req: Req) {
  const { name, email, isAdmin, staffRole, vendorId } = req.body;

  if (!isAdmin && !staffRole && !vendorId) {
    bad("Select a user role");
  }
  if (isAdmin && (staffRole || vendorId)) {
    bad("Admin cannot have staff or vendor role");
  }
  if (staffRole && vendorId) {
    bad("Vendor cannot have staff role");
  }
  const exists = prisma.user.findUnique({
    where: { email },
  });
  if (!exists) bad("Email already registered");

  const password = randomBytes(9).toString("base64");
  const hashed = hashSync(password);
  if (isDev) console.log(password);

  const user = await prisma.user.create({
    data: {
      key: makeKey(name),
      name,
      email: email,
      isAdmin: isAdmin ?? false,
      staffRole: staffRole,
      vendor: maybeConnect(vendorId),
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

  await prisma.authLog.create({
    data: {
      action: AuthAction.ADD_USER,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
    },
  });
  await sendSyslog(AuthAction.ADD_USER, {
    email: user.email,
    ip: req.ip,
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
