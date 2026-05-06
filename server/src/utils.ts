import type * as H from "node:http";
import { httpErrors } from "@fastify/sensible";
import dayjs from "dayjs";
import timeZone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import type * as F from "fastify";
import type * as Z from "fastify-zod-openapi";
import { uuidv7 } from "uuidv7";
import z from "zod";

dayjs.extend(timeZone);
dayjs.extend(utc);

export type Maybe<T> = T | null | undefined;

export type Falsey<T> = T | null | undefined | "" | false;

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
  body: (() => B) | null,
  f: AppRouteFunc<{ body: B }, T>,
) {
  return appRoute(() => ({
    url,
    method: "POST",
    schema: body ? { body: body() } : undefined,
    handler(this, req, reply) {
      return f(req, this, reply);
    },
  }));
}

export function getRoute<Q extends FS["querystring"], T>(
  url: string,
  query: (() => Q) | null,
  f: AppRouteFunc<{ querystring: Q }, T>,
) {
  return appRoute(() => ({
    url,
    method: "GET",
    schema: query ? { querystring: query() } : undefined,
    handler(this, req, reply) {
      return f(req, this, reply);
    },
  }));
}

type IdParamUrl = `${string}/:id` | `${string}/:id/${string}`;

const idParamZ = z.strictObject({
  id: z.string().describe("The selected UUID"),
});

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

export type HasId = string | { id: string };

export function idOf(i: HasId) {
  return typeof i === "string" ? i : i.id;
}
export function connectId(i: HasId) {
  return { connect: { id: idOf(i) } };
}

export function maybeConnect(i: Maybe<HasId>) {
  return i ? connectId(i) : undefined;
}

export function currentTime() {
  return dayjs().tz("Africa/Abidjan");
}
