import { configDotenv } from "dotenv";
import z from "zod";

configDotenv({ quiet: true });

function isTrue(s: unknown) {
  return s === true || s === "true" || s === "1";
}

const schema = z.object({
  PORT: z.preprocess((s) => s && Number(s), z.int().default(3000)),
  NODE_ENV: z.string().optional(),
  FRONTEND_URL: z.url().optional(),
  CORS_ANY: z.string().optional(),
  TRUST_PROXY: z
    .union([z.ipv4(), z.cidrv4(), z.literal("false").transform(() => false)])
    .default("127.0.0.1"),

  JWT_SECRET: z.string().optional(),
  CRYPTO_KEY: z.string().optional(),
  TURNSTILE_SECRET: z.string().optional(),

  WIPE_KEY: z.string().optional(),
  WIPE_ALLOWED_IN_PROD: z.preprocess(isTrue, z.boolean()).optional(),

  DATABASE_URL: z.url({ protocol: /postgres/, error: "Invalid URL" }),
  DB_SSL: z.preprocess(isTrue, z.boolean()),

  MAIL_URL: z.url().optional(),
  MAIL_FROM: z.email().optional(),
  MAIL_NAME: z.string().optional(),
  MAIL_SECURE: z.string().optional(),
});

export const appEnv = await schema.parseAsync(process.env).catch((e) => {
  console.error(e instanceof z.ZodError ? z.prettifyError(e) : e);
  process.exit(1);
});

export const isDev = appEnv.NODE_ENV !== "production";

const corsAny = isDev || isTrue(appEnv.CORS_ANY);
export const corsOrigin = corsAny ? "*" : appEnv.FRONTEND_URL || "*";
