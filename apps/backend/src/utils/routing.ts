import type * as H from "node:http";
import type * as F from "fastify";
import type * as Z from "fastify-zod-openapi";
import z from "zod";
import type { Allow } from "../auth/guard";

type FS = F.FastifySchema;

type AsyncPlugin = Z.FastifyPluginAsyncZodOpenApi;

type NormalPlugin = (
  ...a: Parameters<AsyncPlugin>
) => Awaited<ReturnType<AsyncPlugin>>;

export type AppPlugin = NormalPlugin | AsyncPlugin;

export type App = Parameters<AppPlugin>[0];

type AppRoute<S extends FS> = F.RouteOptions<
  F.RawServerDefault,
  H.IncomingMessage,
  H.ServerResponse,
  F.RouteGenericInterface,
  F.ContextConfigDefault,
  S,
  Z.FastifyZodOpenApiTypeProvider,
  F.FastifyBaseLogger
>;

type AppRouteParams<S extends FS> = Parameters<AppRoute<S>["handler"]>;

export type AppRequest<S extends FS> = AppRouteParams<S>[0];

export type AppReply<S extends FS> = AppRouteParams<S>[1];

export type AppLog = App["log"];

export type AppRouteFunc<S extends FS, T> = (
  req: AppRequest<S>,
  app: App,
  rep: AppReply<S>,
) => T | Promise<T>;

export type AnyRequest = AppRequest<FS>;

export type AnyReply = AppReply<FS>;

export type RequestWith<T> = AnyRequest & { body: T };

export const appPlugin = (p: AppPlugin) => p;

export function appRoute<S extends FS>(r: AppRoute<S>) {
  return appPlugin((app) => void app.route(r));
}

export function rbac(allow: Allow) {
  return (req: AnyRequest, _: AnyReply, done: () => void) => {
    req.allow = allow;
    done();
  };
}

export function postRoute<S extends FS["body"], T>(args: {
  url: `/${string}`;
  schema?: S;
  handler: AppRouteFunc<{ body: S }, T>;
  method?: F.HTTPMethods;
  allow?: Allow;
}) {
  const { url, schema, handler, allow, method = "POST" } = args;
  return appRoute({
    url,
    method,
    schema: schema && { body: schema },
    onRequest: allow && rbac(allow),
    handler(this, req, reply) {
      return handler(req, this, reply);
    },
  });
}

export function getRoute<S extends FS["querystring"], T>(args: {
  url: string;
  schema?: S;
  handler: AppRouteFunc<{ querystring: S }, T>;
  allow?: Allow;
}) {
  const { url, schema, handler, allow } = args;
  return appRoute({
    url,
    method: "GET",
    schema: schema && { querystring: schema },
    onRequest: allow && rbac(allow),
    handler(this, req, reply) {
      return handler(req, this, reply);
    },
  });
}

type IdParamUrl = `${string}/:id` | `${string}/:id/${string}`;

const idParamZ = z.strictObject({
  id: z.string().describe("The selected UUID"),
});

export function idRoute<T>(
  url: IdParamUrl,
  f: AppRouteFunc<{ params: typeof idParamZ }, T>,
) {
  return appRoute({
    url,
    method: "GET",
    schema: { params: idParamZ },
    handler(this, req, reply) {
      return f(req, this, reply);
    },
  });
}
