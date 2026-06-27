import { httpErrors } from "@fastify/sensible";

export type ErrorWhy = string | Error | (() => Error);

export function bad(why: ErrorWhy): never {
  if (typeof why === "string") throw httpErrors.badRequest(why);
  throw typeof why === "function" ? why() : why;
}

export function notFound(message = "Not found"): never {
  throw httpErrors.notFound(message);
}

export function unauthorized(): never {
  throw httpErrors.unauthorized();
}

export function accessDenied(): never {
  throw httpErrors.forbidden();
}
