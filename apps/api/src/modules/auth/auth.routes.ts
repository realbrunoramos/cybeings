import type { FastifyInstance } from "fastify";
import { generateNonce, verifySignature, generateJWT } from "./auth.service.js";

interface VerifyBody {
  message: string;
  signature: string;
}

// Authentication module — SIWE nonce/verify and JWT issuance (task F1-T1).
export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/nonce",
    {
      config: {
        // Tighter limit than the global one: nonce generation is the most
        // bot-targeted endpoint in a SIWE flow.
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
    },
    async (_request, reply) => {
      const nonce = await generateNonce(app.redis);
      return reply.code(200).send({ nonce });
    },
  );

  app.post("/verify", async (request, reply) => {
    const body = (request.body ?? {}) as Partial<VerifyBody>;
    if (typeof body.message !== "string" || typeof body.signature !== "string") {
      return reply.code(400).send({ error: "message and signature are required" });
    }

    try {
      const address = await verifySignature(app.redis, body.message, body.signature);
      const token = generateJWT(address);
      return reply.code(200).send({ token, address });
    } catch (err) {
      // Log internally but never expose verification details to the client.
      request.log.warn({ err }, "SIWE verification failed");
      return reply.code(401).send({ error: "Authentication failed" });
    }
  });
}
