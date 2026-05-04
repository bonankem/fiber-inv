import type * as H from "node:http";
import { httpErrors } from "@fastify/sensible";
import type * as F from "fastify";
import type * as Z from "fastify-zod-openapi";
import { uuidv7 } from "uuidv7";
import z from "zod";

export type Maybe<T> = T | null | undefined;

type FS = F.FastifySchema;

export type AppPlugin = Z.FastifyPluginAsyncZodOpenApi;

export type App = Parameters<AppPlugin>[0];

export type AppRoute<S extends FS> = F.RouteOptions<
  F.RawServerDefault,
  H.IncomingMessage,
  H.ServerResponse,
  F.RouteGenericInterface,
  F.ContextConfigDefault,
  S,
  Z.FastifyZodOpenApiTypeProvider,
  F.FastifyBaseLogger
>;

export type AppHandler<S extends FS> = AppRoute<S>["handler"];

export type AppRequest<S extends FS> = Parameters<AppHandler<S>>[0];

export type AppReply<S extends FS = FS> = Parameters<AppHandler<S>>[1];

export type AppRouteFunc<S extends FS, T> = (
  req: AppRequest<S>,
  app: App,
  rep: AppReply<S>,
) => Promise<T>;

export const appPlugin = (p: AppPlugin) => p;

export function appRoute<S extends FS>(r: () => AppRoute<S>) {
  return appPlugin(async (app) => void app.route(r()));
}

export function postRoute<B extends FS["body"], T>(
  url: string,
  body: () => B,
  f: AppRouteFunc<{ body: B }, T>,
) {
  return appRoute(() => ({
    url,
    method: "POST",
    schema: { body: body() },
    handler(this, req, reply) {
      return f(req, this, reply);
    },
  }));
}

export function getRoute<Q extends FS["querystring"], T>(
  url: string,
  query: () => Q,
  f: AppRouteFunc<{ querystring: Q }, T>,
) {
  return appRoute(() => ({
    url,
    method: "GET",
    schema: { querystring: query() },
    handler(this, req, reply) {
      return f(req, this, reply);
    },
  }));
}

type IdParamUrl = `${string}/:id` | `${string}/:id/${string}`;

const idParamZ = z.strictObject({
  id: z.string().describe("The selected UUID"),
});

type IdParamT = z.infer<typeof idParamZ>;

export function idRoute<T>(
  url: IdParamUrl,
  f: AppRouteFunc<{ params: typeof idParamZ }, T>,
) {
  return appRoute(() => ({
    url,
    method: "GET",
    schema: { params: idParamZ },
    handler(this, req, reply) {
      return f(req, this, reply);
    },
  }));
}

export function shape<T extends object>(f: (zod: typeof z) => T) {
  return z.strictObject(f(z));
}

export type Shape<T> = z.infer<T>;

export type ErrorWhy = string | Error | (() => Error);

export function bad(why: ErrorWhy): never {
  if (typeof why === "string") throw httpErrors.badRequest(why);
  throw typeof why === "function" ? why() : why;
}

export function notFound(message = "Not found"): never {
  throw httpErrors.notFound(message);
}

export function newUuid() {
  return uuidv7();
}
