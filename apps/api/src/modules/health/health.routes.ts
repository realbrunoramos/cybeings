import type { FastifyInstance } from "fastify";

// Liveness endpoint used by Railway and uptime monitors.
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => {
      return {
            status: "ok",
                  service: "cybeings-api",
                        timestamp: new Date().toISOString(),
                            };
                              });
                              }