import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Fail fast: if $connect rejects, the error propagates and the server
// never starts listening.
export const prismaPlugin = fp(async (app: FastifyInstance): Promise<void> => {
  await prisma.$connect();
  app.log.info("Prisma connected");

  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
