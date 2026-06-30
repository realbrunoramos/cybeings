import type { FastifyInstance } from "fastify";

// Island module — will own island purchase, organic shapes, cover images
// and flags (tasks F1-T4 through F1-T8).
export async function islandRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => {
      return reply.code(501).send({
            module: "island",
                  status: "not_implemented",
                        message: "Island endpoints are not available yet.",
                            });
                              });
                              }