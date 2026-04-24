import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
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

const app = fastify({
  logger: { transport: { target: "@fastify/one-line-logger" } },
}).withTypeProvider<FastifyZodOpenApiTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors);
app.register(fastifyFormbody);
app.register(fastifyMultipart);
app.register(fastifySensible);

await app.register(fastifyZodOpenApiPlugin);
await app.register(fastifySwagger, {
  openapi: { openapi: "3.1.0" },
  ...fastifyZodOpenApiTransformers,
});

app.get("/", () => ({ name: "ServiceX" }));
app.listen({ port: 3000 });
