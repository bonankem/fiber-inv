import type { JWT } from "@fastify/jwt";
import { compareSync, hashSync } from "bcryptjs";
import { type AuthResultT, AuthStatus, type AuthSuccessT } from "schema/auth";
import { userFullP } from "schema/people";
import { type Prisma, prisma } from "#/prisma";
import type { UserSelect } from "#/prisma/generated/models";
import { bad, type Maybe, newUuid } from "#/utils";

export function badLogin(): never {
  bad("Invalid email or password");
}

const loginUserS = {
  id: true,
  isAdmin: true,
  password: true,
  authenticator: true,
} satisfies UserSelect;

type LoginUserT = Prisma.UserGetPayload<{ select: typeof loginUserS }>;

export function getLoginUser(where: Prisma.UserWhereUniqueInput) {
  return prisma.user.findUnique({ where, select: loginUserS });
}

export function checkHash(
  plain: string,
  hashed: Maybe<string>,
): hashed is string {
  return !!hashed && compareSync(plain, hashed);
}

export async function authSuccess(
  jwt: JWT,
  userId: string,
  existing?: string,
): Promise<AuthSuccessT> {
  const id = existing || newUuid();
  const ids = { userId, sessionId: id };
  const token = jwt.sign(ids, { expiresIn: "1h" });
  const refresh = jwt.sign(ids, { expiresIn: "7d" });
  const expiry = new Date(Date.now() + 7 * 86400000);
  const hashed = hashSync(refresh);

  const { user } = await prisma.session.upsert({
    where: { id },
    update: { hashed, expiry, userId },
    create: { hashed, expiry, userId, id },
    select: { user: userFullP },
  });

  const status = AuthStatus.SUCCESS;
  return { status, user, token, refresh };
}

export async function authResult(
  jwt: JWT,
  user: LoginUserT,
): Promise<AuthResultT> {
  // TODO: implement other auth statuses
  return authSuccess(jwt, user.id);
}
