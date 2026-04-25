import { randomBytes } from "node:crypto";
import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
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
import { appEnv } from "./env";

const app = fastify({
  logger: { transport: { target: "@fastify/one-line-logger" } },
}).withTypeProvider<FastifyZodOpenApiTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

function getJwtSecret() {
  if (appEnv.JWT_SECRET) return appEnv.JWT_SECRET;
  app.log.warn("No env.JWT_SECRET");
  return randomBytes(24).toString("base64");
}

app.register(fastifyCors);
app.register(fastifyFormbody);
app.register(fastifyMultipart);
app.register(fastifySensible);
app.register(fastifyJwt, {
  secret: getJwtSecret(),
});

await app.register(fastifyZodOpenApiPlugin);
await app.register(fastifySwagger, {
  openapi: { openapi: "3.1.0" },
  ...fastifyZodOpenApiTransformers,
});

app.get("/", () => ({ name: "ServiceX" }));

app.listen({ port: appEnv.PORT });
