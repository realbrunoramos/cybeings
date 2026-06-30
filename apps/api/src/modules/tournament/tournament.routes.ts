import type { FastifyInstance } from "fastify";

// Tournament module — will own duels, scoring and reward escrow (Phase 2).
export async function tournamentRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => {
      return reply.code(501).send({
            module: "tournament",
                  status: "not_implemented",
                        message: "Tournament endpoints are not available yet.",
                            });
                              });
                              }