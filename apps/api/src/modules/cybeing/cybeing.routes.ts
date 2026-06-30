import type { FastifyInstance } from "fastify";

// Cybeing module — will own the async minting pipeline, profiles and chat
// (tasks F1-T9 and F1-T10).
export async function cybeingRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => {
      return reply.code(501).send({
            module: "cybeing",
                  status: "not_implemented",
                        message: "Cybeing endpoints are not available yet.",
                            });
                              });
                              }