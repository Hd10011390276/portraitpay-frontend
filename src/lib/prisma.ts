import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const log =
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"];

  const clientOptions: ConstructorParameters<typeof PrismaClient>[0] = { log };

  // Only set datasource URL if DATABASE_URL is a non-empty string
  // This allows the build to succeed even without env vars during build time
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.trim().length > 0) {
    clientOptions.datasources = {
      db: { url: dbUrl },
    };
  }

  return new PrismaClient(clientOptions);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
