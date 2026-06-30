import type { FastifyInstance } from "fastify";

// Marketplace module — will own listings, buy/sell and rentals (Phase 2).
export async function marketplaceRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => {
      return reply.code(501).send({
            module: "marketplace",
                  status: "not_implemented",
                        message: "Marketplace endpoints are not available yet.",
                            });
                              });
                              }