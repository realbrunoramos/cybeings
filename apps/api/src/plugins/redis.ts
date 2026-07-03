import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { Redis } from "@upstash/redis";
import { redis } from "../lib/redis.js";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

// Fail fast: if the boot sanity check rejects, the error propagates and the
// server never starts listening. The REST client has no persistent
// connection to tear down, so there is no onClose hook here.
export const redisPlugin = fp(async (app: FastifyInstance): Promise<void> => {
  await redis.set("__boot:ping", "ok", { ex: 10 });
  const value = await redis.get("__boot:ping");
  if (value !== "ok") {
    throw new Error("Redis boot sanity check failed: unexpected value");
  }
  app.log.info("Redis connected");

  app.decorate("redis", redis);
});
