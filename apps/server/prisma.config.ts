import { configDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

configDotenv();

export default defineConfig({
  schema: "prisma",
  datasource: { url: process.env.DATABASE_URL },
  migrations: { path: "prisma/migrations" },
});
