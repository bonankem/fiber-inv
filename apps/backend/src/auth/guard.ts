import fastifyPlugin from "fastify-plugin";
import { type UserFullT, userFullP } from "schema/people";
import { prisma } from "#/db";
import { accessDenied, unauthorized } from "#/utils/errors";
import type { AnyRequest } from "#/utils/routing";
import {
  type AuthIdsT,
  sessionExpired,
  sessionReplaced,
  tryAuthToken,
} from "./utils";

export enum Allow {
  PUBLIC = "PUBLIC",
  USER = "USER",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
}

declare module "fastify" {
  interface FastifyRequest {
    allow: Allow;
    authIds: AuthIdsT;
    authUser: UserFullT;
    maybeIds: AuthIdsT | null;
    maybeUser: UserFullT | null;
  }
}

export function getReqToken(req: AnyRequest) {
  const header = req.headers.authorization;
  const bearer = header && /Bearer (.+)/.exec(header)?.[1];
  if (bearer) return bearer;

  const alt = req.headers["x-auth-token"];
  const xToken = Array.isArray(alt) ? alt[0] : alt;
  return xToken || undefined;
}

export const authGuard = fastifyPlugin(async (app) => {
  // default access policy is to allow only logged-in users
  app.decorateRequest("allow", Allow.USER);
  app.decorateRequest("maybeIds", null);
  app.decorateRequest("maybeUser", null);

  app.decorateRequest("authIds", {
    getter() {
      return this.maybeIds || unauthorized();
    },
  });

  app.decorateRequest("authUser", {
    getter() {
      return this.maybeUser || unauthorized();
    },
  });

  app.addHook("preValidation", async (req) => {
    const allow = req.allow;
    const isPublic = allow === Allow.PUBLIC;

    const token = getReqToken(req);
    const authIds = tryAuthToken(app.jwt, token);
    req.maybeIds = authIds;
    if (!authIds) {
      if (isPublic) return;
      else unauthorized();
    }

    const now = new Date();
    const { sessionId: id, userId } = authIds;
    const session = await prisma.session.findUnique({
      where: { id, userId, expiresAt: { gt: now } },
      include: { user: userFullP },
    });
    // no active session and allow !== PUBLIC -> 401
    req.maybeUser = session?.user || null;
    if (isPublic) return;
    if (!session) sessionExpired();
    if (session.replacedAt) sessionReplaced();

    const { isAdmin, staffRole } = session.user;
    if (isAdmin) return; // admins bypass RBAC
    if (allow === Allow.ADMIN) accessDenied();
    if (allow === Allow.STAFF && !staffRole) accessDenied();
  });
});
