import { randomBytes } from "node:crypto";
import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifySchedule from "@fastify/schedule";
import fastifySensible from "@fastify/sensible";
import fastifySwagger from "@fastify/swagger";
import fastify from "fastify";
import {
  type FastifyZodOpenApiTypeProvider,
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransformers,
  serializerCompiler,
  validatorCompiler,
} from "fastify-zod-openapi";
import { initSyslogServer } from "./admin/adm-syslog.api";
import api from "./api";
import { appEnv, corsOrigin } from "./env";
import { appErrorHandler } from "./error";
import { verifyMail } from "./mail";
import { appSocket } from "./socket";

const app = fastify({
  logger: { transport: { target: "@fastify/one-line-logger" } },
  bodyLimit: 50 * 1024 * 1024, // 100MB
  trustProxy: appEnv.TRUST_PROXY,
}).withTypeProvider<FastifyZodOpenApiTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

function getJwtSecret() {
  if (appEnv.JWT_SECRET) return appEnv.JWT_SECRET;
  app.log.warn("No env.JWT_SECRET");
  return randomBytes(24).toString("base64");
}

app.register(fastifyCors, { origin: corsOrigin });
app.register(fastifyHelmet, { crossOriginResourcePolicy: false });
app.register(fastifyFormbody);
app.register(fastifyMultipart);
app.register(fastifySensible);
app.register(fastifyJwt, { secret: getJwtSecret() });
app.register(appSocket);

await app.register(fastifySchedule);
await app.register(fastifyZodOpenApiPlugin);
await app.register(fastifySwagger, {
  openapi: { openapi: "3.1.0" },
  ...fastifyZodOpenApiTransformers,
});

app.register(api);

app.setErrorHandler(appErrorHandler);

const remote = process.argv.includes("--host");
app.listen({
  port: appEnv.PORT,
  host: remote ? "0.0.0.0" : "127.0.0.1",
});

initSyslogServer();
verifyMail(app.log);
