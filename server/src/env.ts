import { configDotenv } from "dotenv";
import z from "zod";

configDotenv({ quiet: true });

const schema = z.object({
  NODE_ENV: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  CRYPTO_KEY: z.string().optional(),
  PORT: z.number().default(3000),
  DATABASE_URL: z.url({
    protocol: /postgresql/,
    error: "Invalid URL",
  }),
});

export const appEnv = await schema.parseAsync(process.env).catch((e) => {
  console.error(e instanceof z.ZodError ? z.prettifyError(e) : e);
  process.exit(1);
});
