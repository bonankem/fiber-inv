import dayjs from "dayjs";
import { prisma } from "#/db";
import { type AnyReply, getRoute } from "#/utils";

export const userInfoApi = getRoute("/admin/user-info", null, (_, __, res) =>
  userInfo(res),
);

async function userInfo(res: AnyReply) {
  const users = await prisma.user.findMany({
    include: { password: true },
  });
  const acts = await prisma.authLog.findMany({
    where: { action: "LOGIN_SUCCESS" },
    orderBy: { time: "desc" },
  });

  const lines = users.map((u) => {
    const { name, email, isAdmin, staffRole, password } = u;
    const access = isAdmin ? "ADMIN" : staffRole ? "STAFF" : "VENDOR";
    const creation = dayjs(u.createdAt).format("YYYY-MM-DD");

    const e = email.toLowerCase();
    const lastLogin = acts.find((a) => a.email.toLowerCase() === e)?.time;
    const ll = lastLogin ? dayjs(lastLogin).format("YYYY-MM-DD") : "";
    const pass = password?.mustChange ? null : password?.lastChange;
    const pw = pass ? dayjs(pass).format("YYYY-MM-DD") : "";
    return [email, name, access, "ACTIVE", creation, ll, pw]
      .map((s) => `"${s}"`)
      .join(",");
  });
  const head =
    "email,name,access level,status,creation date,last login,last password change";
  const csv = [head, ...lines].join("\n");
  return res.type("text/csv").send(csv);
}
