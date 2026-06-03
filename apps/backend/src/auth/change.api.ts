import type { JWT } from "@fastify/jwt";
import { compareSync, hashSync } from "bcryptjs";
import { type AuthChangeReqT, authChangeReqZ } from "schema/auth";
import { prisma } from "#/db";
import { bad, postRoute } from "#/utils";
import { ADMIN_PASS_LENGTH, PASS_HISTORY, USER_PASS_LENGTH } from "./config";
import { authResult, badToken, getLoginUser, verifyTempToken } from "./utils";

export default postRoute(
  "/auth/change",
  () => authChangeReqZ,
  (req, app) => authChange(req.body, app.jwt),
);

function wrongPassword(): never {
  bad("Old password is not correct");
}

async function authChange(req: AuthChangeReqT, jwt: JWT) {
  const { userId } = verifyTempToken(jwt, req.token);
  const user = await getLoginUser({ id: userId });
  if (!user) badToken();

  const pass = user?.password || wrongPassword();
  if (!compareSync(req.password, pass.hashed)) wrongPassword();
  if (!pass.mustChange) bad("Password was already changed");

  const p = req.newPassword;
  const min = user.isAdmin ? ADMIN_PASS_LENGTH : USER_PASS_LENGTH;
  if (p.length < min) bad("Password too short");
  if (p === req.password) bad("Cannot reuse the same password");

  const hashed = hashSync(p);
  const history = [...pass.history, hashed].slice(-PASS_HISTORY);

  const updated = await prisma.password.update({
    where: { userId: user.id },
    data: {
      hashed,
      history,
      mustChange: false,
      lastChange: new Date(),
    },
  });

  return authResult(jwt, { ...user, password: updated });
}
