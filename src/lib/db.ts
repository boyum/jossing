import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // Check if we're using Turso in production
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const adapter = new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    return new PrismaClient({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore TSC sometimes complains that `adapter` is not a valid option
      adapter,
    });
  }

  // Use local SQLite for development
  return new PrismaClient();
}

export const db = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
