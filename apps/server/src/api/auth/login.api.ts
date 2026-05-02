import type { IncomingHttpHeaders } from "node:http";
import type { JWT } from "@fastify/jwt";
import { compareSync } from "bcryptjs";
import { type AuthLoginReqT, authLoginReqZ } from "schema/auth";
import { prisma } from "#/prisma";
import { bad, postRoute } from "#/utils";
import { authSuccess, badLogin, getLoginUser } from "./utils";

export default postRoute(
  "/auth/login",
  () => authLoginReqZ,
  (req, app) => login(req, app.jwt),
);

type Req = {
  body: AuthLoginReqT;
  headers: IncomingHttpHeaders;
  ip: string;
};

export async function login(req: Req, jwt: JWT) {
  const userAgent = req.headers["user-agent"] || bad("No User-Agent");
  const ipAddress = req.ip || bad("No IP Address");

  const { email, password } = req.body;
  const u = await getLoginUser({ email });
  const p = u?.password || badLogin();

  const success = compareSync(password, p.hashed);
  await prisma.passwordAttempt.create({
    data: { email, success, ipAddress, userAgent },
  });

  return success ? authSuccess(jwt, p.userId) : badLogin();
}
