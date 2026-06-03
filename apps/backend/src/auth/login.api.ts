import type { IncomingHttpHeaders } from "node:http";
import type { JWT } from "@fastify/jwt";
import { type AuthLoginReqT, authLoginReqZ } from "schema/auth";
import { prisma } from "#/db";
import { bad, postRoute } from "#/utils";
import { authResult, badLogin, checkHash, getLoginUser } from "./utils";

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

async function login(req: Req, jwt: JWT) {
  const { email, password } = req.body;
  const u = await getLoginUser({ email });

  if (!checkHash(password, u?.password?.hashed)) {
    await attempt(req, false);
    badLogin();
  }

  await attempt(req, true);
  return authResult(jwt, u);
}

function attempt(req: Req, success: boolean) {
  return prisma.passwordAttempt.create({
    data: {
      success,
      email: req.body.email,
      ipAddress: req.ip || bad("No IP"),
      userAgent: req.headers["user-agent"] || bad("No UA"),
    },
  });
}
