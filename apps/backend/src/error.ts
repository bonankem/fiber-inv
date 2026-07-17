import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { unique } from "remeda";
import { ApiError, Err } from "schema/errors";
import { ZodError } from "zod";
import { isDev } from "./env";
import type { App } from "./utils/routing";

type ErrorHandler = Parameters<App["setErrorHandler"]>[0];

export const appErrorHandler: ErrorHandler = function (
  this,
  error,
  req,
  reply,
) {
  if (!(error instanceof Error)) {
    return reply.send(error);
  }

  if (error instanceof ApiError) {
    if (isDev) this.log.error(`${error.key}: ${error.param}`);
    return reply.status(error.status).send({
      message: error.message,
      param: error.param,
    });
  }

  function send(message: Err, param?: unknown) {
    return reply.status(400).send({ message, param });
  }

  if (error instanceof ZodError) {
    return send(Err.INVALID_INPUT, error.issues[0].path?.[0]);
  }

  if (error.message.includes("Invalid input: ")) {
    const issues = error.message.match(
      /(\S+) Invalid input: (.+?)(?=, (body|params|query)|$)/g,
    );

    const uniqueIssues = unique(
      (issues || []).map((i) =>
        i
          .replace(/^(body|params|query)\/|\/\d+|Invalid input: /gi, "")
          .replace(/expected .+, received undefined/g, "required"),
      ),
    );
    if (uniqueIssues.length) {
      return send(Err.INVALID_INPUT, uniqueIssues[0]);
    }
  }

  const isAdmin = req.maybeUser?.isAdmin;
  if (error instanceof PrismaClientKnownRequestError) {
    const { code, meta } = error;
    if (code === "P2001") {
      return send(Err.NOT_FOUND, meta?.model_name);
    }
    if (code === "P2002") {
      return send(Err.ALREADY_EXISTS, meta?.constraint);
    }
    if (code === "P2003") {
      return send(Err.NOT_FOUND, meta?.modelName);
    }
    if (code === "P2025") {
      return send(Err.NOT_FOUND, meta?.modelName);
    }
  }

  const ctor = error.constructor.name;
  if (isAdmin && ctor.startsWith("Prisma")) {
    const lines = error.message.split(/\n/g);
    const relevantLines = lines.filter(
      (l, i, ls) =>
        i < 5 ||
        i < ls.length - 5 ||
        /[~?]{2,}/.test(l) ||
        /[~?]{2,}/.test(ls[i + 1] || ""),
    );
    const message = `${ctor}: ${relevantLines.join("\n")}`;
    console.error(message);
    return send(Err.INTENAL_SERVER_ERROR, message);
  }

  console.error(error.message.slice(0, 100));
  return send(Err.INTENAL_SERVER_ERROR, error.message);
};
