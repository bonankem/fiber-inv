import { PrismaPg } from "@prisma/adapter-pg";
import { appEnv } from "#/env";
import { PrismaClient } from "./generated/client";

function envUrl() {
  const url = appEnv.DATABASE_URL;
  const ssl = appEnv.DB_SSL;

  // append sslmode for Heroku if needed
  if (!ssl || /sslmode/i.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}sslmode=no-verify`;
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: envUrl() }),
});

export * from "./generated/client";
