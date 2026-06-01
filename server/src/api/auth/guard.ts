import { httpErrors } from "@fastify/sensible";
import type { FastifySchema } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { type UserFullT, userFullP } from "schema/people";
import { prisma } from "#/prisma";
import { type AppRequest, accessDenied, unauthorized } from "#/utils";
import { type AuthTokenT, tryAuthToken } from "./utils";

export enum Allow {
  PUBLIC = "PUBLIC",
  USER = "USER",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
}

declare module "fastify" {
  interface FastifyRequest {
    allow: Allow;
    authIds: AuthTokenT | null;
    maybeUser: UserFullT | null;
    authUser: UserFullT;
  }
}

export function getReqToken(req: AppRequest<FastifySchema>) {
  const header = req.headers.authorization;
  const bearer = header && /Bearer (.+)/.exec(header)?.[1];
  if (bearer) return bearer;

  const alt = req.headers["x-auth-token"];
  const xToken = Array.isArray(alt) ? alt[0] : alt;
  return xToken || undefined;
}

export const authGuard = fastifyPlugin(async (app) => {
  app.decorateRequest("allow", Allow.USER);
  app.decorateRequest("authIds", null);
  app.decorateRequest("maybeUser", null);
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
    req.authIds = authIds;
    if (!authIds) {
      if (isPublic) return;
      else unauthorized();
    }

    const now = new Date();
    const { sessionId: id, userId } = authIds;
    const session = await prisma.session.findUnique({
      where: { id, userId, expiry: { gt: now } },
      include: { user: userFullP },
    });
    // no active session and allow !== PUBLIC -> 401
    req.maybeUser = session?.user || null;
    if (isPublic) return;
    if (!session) throw httpErrors.unauthorized();

    const { isAdmin, staffRole } = session.user;
    if (isAdmin) return; // admins bypass RBAC
    if (allow === Allow.ADMIN) accessDenied();
    if (allow === Allow.STAFF && !staffRole) accessDenied();
  });
});
