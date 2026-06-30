import type { FastifyInstance } from "fastify";

// Authentication module — will own SIWE nonce/verify and JWT issuance (task F1-T1).
export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => {
      return reply.code(501).send({
            module: "auth",
                  status: "not_implemented",
                        message: "Authentication endpoints are not available yet.",
                            });
                              });
                              }