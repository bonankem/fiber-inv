import type { JWT } from "@fastify/jwt";
import { compareSync } from "bcryptjs";
import { prisma } from "#/prisma";
import { postRoute } from "#/utils";
import { type LoginReq, loginReq } from "./auth.types";
import { badLogin } from "./auth.utils";

export default postRoute(
  "/auth/login",
  () => loginReq,
  (req, app) => login(req.body, app.jwt),
);

export async function login(req: LoginReq, jwt: JWT) {
  const found = await prisma.user.findFirst({
    where: { email: req.email },
    include: { password: true },
  });
  if (!found?.password) badLogin();

  const { password: p, ...user } = found;
  if (!compareSync(req.password, p.hashed)) badLogin();

  const token = jwt.sign({ userId: user.id }, { expiresIn: "7d" });
  return { user, token };
}
