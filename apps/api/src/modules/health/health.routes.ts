import type { FastifyInstance } from "fastify";

const DB_CHECK_TIMEOUT_MS = 2_000;

async function checkDatabase(app: FastifyInstance): Promise<"ok" | "down"> {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      app.prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error("Database health check timed out")),
          DB_CHECK_TIMEOUT_MS,
        );
      }),
    ]);
    return "ok";
  } catch (err) {
    app.log.error({ err }, "Database health check failed");
    return "down";
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

// Liveness endpoint used by Railway and uptime monitors.
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    const database = await checkDatabase(app);

    const body = {
      status: database === "ok" ? "ok" : "degraded",
      service: "cybeings-api",
      timestamp: new Date().toISOString(),
      checks: { database },
    };

    if (database === "down") {
      return reply.code(503).send({
        ...body,
        message: "Database is unreachable.",
      });
    }

    return body;
  });
}
