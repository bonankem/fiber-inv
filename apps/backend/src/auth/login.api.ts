import type { IncomingHttpHeaders } from "node:http";
import type { JWT } from "@fastify/jwt";
import { type AuthLoginReqT, authLoginReqZ } from "schema/auth";
import { postRoute } from "#/utils";
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
    badLogin();
  }

  return authResult(jwt, u);
}
