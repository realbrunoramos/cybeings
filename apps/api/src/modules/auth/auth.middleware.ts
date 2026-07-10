import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyJWT } from "./auth.service.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: { address: string };
  }
}

const BEARER_PREFIX = "Bearer ";

/**
 * Fastify preHandler that requires a valid Bearer JWT. On success it decorates
 * request.user with the verified address; otherwise it replies 401 and stops
 * the request. Use with `preHandler: [authenticate]` on protected routes.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  if (header === undefined || !header.startsWith(BEARER_PREFIX)) {
    await reply.code(401).send({ error: "Missing authorization token" });
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  try {
    const payload = verifyJWT(token);
    request.user = { address: payload.address };
  } catch {
    await reply.code(401).send({ error: "Invalid or expired token" });
  }
}
