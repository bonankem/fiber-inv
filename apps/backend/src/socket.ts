import fastifyPlugin from "fastify-plugin";
import type { IoEvent } from "schema/auth";
import { Server } from "socket.io";
import { type AuthIdsT, tryAuthToken } from "./auth/utils";

declare module "socket.io" {
  interface Socket {
    authIds: AuthIdsT;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    ioUser(userId: string, event: IoEvent, data?: string): void;
    ioAll(event: IoEvent, data?: string): void;
  }
}

export function ioUserRoom(userId: string) {
  return `user:${userId}`;
}

export const appSocket = fastifyPlugin(async (app) => {
  const io = new Server(app.server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const ids = tryAuthToken(app.jwt, token);
    if (!ids) return next(new Error("Auth error"));

    app.log.info("Socket authenticated");
    socket.authIds = ids;
    next();
  });

  io.engine.on("connection", (socket) => {
    socket.request = null;
  });

  io.on("connection", (socket) => {
    app.log.info("Socket connected");
    const ids = socket.authIds;
    if (!ids) return;

    socket.join(ioUserRoom(ids.userId));
  });

  app.addHook("preClose", (done) => {
    io.local.disconnectSockets(true);
    done();
  });

  app.decorate("ioUser", (userId, event, data) => {
    io.to(ioUserRoom(userId)).emit("message", `${event}:${data ?? ""}`);
  });

  app.decorate("ioAll", (event, data) => {
    io.emit("message", `${event}:${data ?? ""}`);
  });
});
