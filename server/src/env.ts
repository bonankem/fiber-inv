import { configDotenv } from "dotenv";
import z from "zod";

configDotenv({ quiet: true });

function isTrue(s: unknown) {
  return s === true || s === "true" || s === "1";
}

const schema = z.object({
  PORT: z.preprocess((s) => s && Number(s), z.int().default(3000)),
  NODE_ENV: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  CRYPTO_KEY: z.string().optional(),
  DATABASE_URL: z.url({ protocol: /postgres/, error: "Invalid URL" }),
  DB_SSL: z.preprocess(isTrue, z.boolean()),
});

export const appEnv = await schema.parseAsync(process.env).catch((e) => {
  console.error(e instanceof z.ZodError ? z.prettifyError(e) : e);
  process.exit(1);
});
