import { configDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

configDotenv({ quiet: true });

const schema = "node_modules/schema/prisma";
export default defineConfig({
  schema,
  migrations: { path: `${schema}/migrations` },
  datasource: { url: process.env.DATABASE_URL },
});
