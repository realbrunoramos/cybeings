import type { FastifyInstance } from "fastify";

const CHECK_TIMEOUT_MS = 2_000;

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} health check timed out`)),
          CHECK_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

async function checkDatabase(app: FastifyInstance): Promise<"ok" | "down"> {
  try {
    await withTimeout(app.prisma.$queryRaw`SELECT 1`, "Database");
    return "ok";
  } catch (err) {
    app.log.error({ err }, "Database health check failed");
    return "down";
  }
}

async function checkRedis(app: FastifyInstance): Promise<"ok" | "down"> {
  try {
    const key = "__health:probe";
    const value = String(Date.now());
    await withTimeout(app.redis.set(key, value, { ex: 5 }), "Redis");
    const stored = await withTimeout(app.redis.get(key), "Redis");
    return String(stored) === value ? "ok" : "down";
  } catch (err) {
    app.log.error({ err }, "Redis health check failed");
    return "down";
  }
}

async function checkMongo(app: FastifyInstance): Promise<"ok" | "down"> {
  try {
    await withTimeout(app.mongoDb.command({ ping: 1 }), "MongoDB");
    return "ok";
  } catch (err) {
    app.log.error({ err }, "MongoDB health check failed");
    return "down";
  }
}

// Liveness endpoint used by Railway and uptime monitors.
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    const [database, redisStatus, mongoStatus] = await Promise.all([
      checkDatabase(app),
      checkRedis(app),
      checkMongo(app),
    ]);

    const allOk = database === "ok" && redisStatus === "ok" && mongoStatus === "ok";

    const body = {
      status: allOk ? "ok" : "degraded",
      service: "cybeings-api",
      timestamp: new Date().toISOString(),
      checks: { database, redis: redisStatus, mongo: mongoStatus },
    };

    if (!allOk) {
      return reply.code(503).send({
        ...body,
        message: "One or more dependencies are unreachable.",
      });
    }

    return body;
  });
}
