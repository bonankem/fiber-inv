import { compareSync } from "bcryptjs";
import {
  type AuthResetCheckReqT,
  type AuthResetCheckResT,
  authResetCheckReqZ,
} from "schema/auth";
import { prisma } from "#/db";
import { postRoute, type RequestWith } from "#/utils";

export const resetCheckApi = postRoute(
  "/auth/reset-check",
  () => authResetCheckReqZ,
  (req) => resetCheck(req),
);

async function invalidReset(): Promise<AuthResetCheckResT> {
  return { valid: false, name: "", email: "", isAdmin: false };
}

async function resetCheck(req: RequestWith<AuthResetCheckReqT>) {
  const [key, secret] = req.body.code.split(":");
  const now = new Date();

  const db = prisma.passwordReset;
  const reset = await db.findUnique({ where: { key } });
  if (!reset || reset.expiresAt < now) return invalidReset();

  const { email, hashed } = reset;
  const valid = compareSync(secret, hashed);
  if (!valid) return invalidReset();

  const user = await prisma.user.findFirst({
    where: { email },
    select: { name: true, email: true, isAdmin: true },
  });
  if (!user) return invalidReset();

  return { valid: true, ...user };
}
