import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { islandRoutes } from "./modules/island/island.routes.js";
import { cybeingRoutes } from "./modules/cybeing/cybeing.routes.js";
import { tournamentRoutes } from "./modules/tournament/tournament.routes.js";
import { marketplaceRoutes } from "./modules/marketplace/marketplace.routes.js";

export async function buildServer() {
  const isDev = env.NODE_ENV === "development";

  const app = Fastify({
    logger: isDev
      ? { transport: { target: "pino-pretty", options: { colorize: true } } }
      : true,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
  });

  await app.register(rateLimit, {
    // TODO(F1-T1): switch to per-wallet-address keying once SIWE auth is live.
    // For now this limits by IP as a temporary safeguard against abuse.
    max: 100,
    timeWindow: "1 minute",
  });

  await app.register(prismaPlugin);

  await app.register(healthRoutes, { prefix: "/" });
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(islandRoutes, { prefix: "/islands" });
  await app.register(cybeingRoutes, { prefix: "/cybeings" });
  await app.register(tournamentRoutes, { prefix: "/tournaments" });
  await app.register(marketplaceRoutes, { prefix: "/marketplace" });

  return app;
}
