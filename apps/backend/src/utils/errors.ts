import { httpErrors } from "@fastify/sensible";

export function fatal(message: string): never {
  throw httpErrors.internalServerError(message);
}
