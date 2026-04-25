import { PrismaPg } from "@prisma/adapter-pg";
import { appEnv } from "#/env";
import { PrismaClient } from "./generated/client";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: appEnv.DATABASE_URL,
  }),
});
