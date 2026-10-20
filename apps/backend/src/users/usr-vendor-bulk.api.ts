import { randomBytes } from "node:crypto";
import { hashSync } from "bcryptjs";
import { uniqueBy } from "remeda";
import { userS, type VendorBulkT, vendorBulkZ } from "schema/people";
import { authLog } from "#/admin/adm-syslog.api";
import { Allow } from "#/auth/guard";
import { AuthAction, prisma } from "#/db";
import { sendMail } from "#/mail";
import { makeKey } from "#/utils/queries";
import { postRoute, type RequestWith } from "#/utils/routing";

export const vendorBulkApi = postRoute({
  url: "/users/vendor-bulk",
  schema: vendorBulkZ,
  handler: createVendorBulk,
  allow: Allow.ADMIN,
});

async function createVendorBulk(req: RequestWith<VendorBulkT>) {
  const items = req.body.items;
  const oldUsers = await prisma.user.findMany();
  const oldEmails = new Set(oldUsers.map((user) => user.email.toLowerCase()));
  const newUsers = items.filter((i) => !oldEmails.has(i.email.toLowerCase()));

  const oldVendors = await prisma.vendor.findMany();
  const oldVendorKeys = new Set(oldVendors.map((vendor) => vendor.key));
  const newVendors = uniqueBy(
    newUsers
      .map(({ vendor }) => ({ name: vendor, key: makeKey(vendor) }))
      .filter((i) => !oldVendorKeys.has(i.key)),
    (v) => v.key,
  );

  if (req.body.commit !== true) {
    return { newVendors, newUsers };
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.vendor.createMany({ data: newVendors });

    const output = [] as { name: string; email: string; password: string }[];
    for (const u of newUsers) {
      const password = randomBytes(9).toString("base64");
      const hashed = hashSync(password);
      await tx.user.create({
        data: {
          key: makeKey(u.name),
          name: u.name,
          email: u.email,
          isAdmin: false,
          staffRole: null,
          vendor: { connect: { key: makeKey(u.vendor) } },
          password: { create: { hashed, history: [hashed] } },
        },
        select: userS,
      });
      output.push({ name: u.name, email: u.email, password });
    }
    return output;
  });

  const logs = result.map((r) => authLog(AuthAction.ADD_USER, req, r.email));
  await Promise.all(logs).catch(() => {});

  result.forEach((user) => {
    sendMail({
      subject: "Welcome to ServiceX",
      to: [user.email],
      lines: [
        "Un compte a été créé pour vous sur MTN CI ServiceX.",
        "Vos identifiants de connexion sont indiqués ci-dessous. Vous devrez changer votre mot de passe après vous être connecté.",
        "-",
        "An account has been created for you on MTNCI ServiceX.",
        "Your login details are shown below. You will need to change your password after logging in.",
      ],
      fields: [
        ["Name", user.name],
        ["Email", user.email],
        ["Password", user.password],
      ],
      button: "/",
    });
  });

  return result;
}
