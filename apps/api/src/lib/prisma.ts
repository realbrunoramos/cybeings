import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

// Cache the client on globalThis outside production so tsx watch hot reloads
// reuse a single connection pool instead of leaking one client per reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
