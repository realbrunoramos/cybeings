import { describe, it, expect } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import {
  generateNonce,
  verifySignature,
  generateJWT,
  AuthError,
  type NonceStore,
} from "../src/modules/auth/auth.service.js";
import { authRoutes } from "../src/modules/auth/auth.routes.js";
import { authenticate } from "../src/modules/auth/auth.middleware.js";

// In-memory nonce store implementing the minimal Redis surface we use.
function createFakeStore(): NonceStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    async set(key, value) {
      map.set(key, value);
      return "OK";
    },
    async get(key) {
      return map.has(key) ? map.get(key) : null;
    },
    async del(key) {
      const existed = map.delete(key);
      return existed ? 1 : 0;
    },
  };
}

interface SiweOverrides {
  domain?: string;
  // Pass null to omit expirationTime entirely.
  expirationTime?: string | null;
  issuedAt?: string;
}

// Build a SIWE message string signed by the given wallet for a given nonce.
// Defaults produce a valid message: correct domain, issuedAt now,
// expirationTime 5 minutes out (within the 10-minute cap).
async function buildSignedSiwe(
  wallet: ethers.HDNodeWallet,
  nonce: string,
  overrides: SiweOverrides = {},
) {
  const now = Date.now();
  const issuedAt = overrides.issuedAt ?? new Date(now).toISOString();

  const fields: Partial<SiweMessage> = {
    domain: overrides.domain ?? "localhost:3000",
    address: wallet.address,
    statement: "Sign in to Cybeings",
    uri: "http://localhost:3000",
    version: "1",
    chainId: 11155111,
    nonce,
    issuedAt,
  };
  if (overrides.expirationTime !== null) {
    fields.expirationTime =
      overrides.expirationTime ?? new Date(now + 5 * 60 * 1000).toISOString();
  }

  const siwe = new SiweMessage(fields);
  const message = siwe.prepareMessage();
  const signature = await wallet.signMessage(message);
  return { message, signature };
}

// Minimal app exposing the real auth routes, backed by a fake redis so we do
// not need the full plugin stack (Postgres/Redis/Mongo) to boot.
async function buildAuthApp(store: NonceStore): Promise<FastifyInstance> {
  const app = Fastify();
  app.decorate("redis", store as unknown as FastifyInstance["redis"]);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.ready();
  return app;
}

describe("auth.service", () => {
  it("generateNonce returns a valid nonce and stores it", async () => {
    const store = createFakeStore();
    const nonce = await generateNonce(store);

    expect(typeof nonce).toBe("string");
    expect(nonce.length).toBeGreaterThanOrEqual(8);
    expect(nonce).toMatch(/^[a-zA-Z0-9]+$/);
    expect(store.map.has(`siwe:nonce:${nonce}`)).toBe(true);
  });

  it("verifySignature completes the full flow and consumes the nonce", async () => {
    const store = createFakeStore();
    const wallet = ethers.Wallet.createRandom();
    const nonce = await generateNonce(store);
    const { message, signature } = await buildSignedSiwe(wallet, nonce);

    const address = await verifySignature(store, message, signature);

    expect(address).toBe(wallet.address);
    // Nonce is single-use: consumed after success.
    expect(store.map.has(`siwe:nonce:${nonce}`)).toBe(false);
  });

  it("verifySignature rejects an invalid signature", async () => {
    const store = createFakeStore();
    const wallet = ethers.Wallet.createRandom();
    const attacker = ethers.Wallet.createRandom();
    const nonce = await generateNonce(store);
    // Message claims `wallet` but is signed by a different key.
    const { message } = await buildSignedSiwe(wallet, nonce);
    const badSignature = await attacker.signMessage(message);

    await expect(verifySignature(store, message, badSignature)).rejects.toBeInstanceOf(AuthError);
  });

  it("verifySignature rejects a non-existent / expired nonce", async () => {
    const store = createFakeStore();
    const wallet = ethers.Wallet.createRandom();
    // Nonce never stored in the fake store.
    const { message, signature } = await buildSignedSiwe(wallet, "unknownnonce123456");

    await expect(verifySignature(store, message, signature)).rejects.toThrow(/nonce/i);
  });

  it("verifySignature rejects a message signed for a different domain", async () => {
    const store = createFakeStore();
    const wallet = ethers.Wallet.createRandom();
    const nonce = await generateNonce(store);
    // Signed for evil.com, but our backend expects localhost:3000.
    const { message, signature } = await buildSignedSiwe(wallet, nonce, {
      domain: "evil.com",
    });

    await expect(verifySignature(store, message, signature)).rejects.toBeInstanceOf(AuthError);
  });

  it("verifySignature rejects a message with no expirationTime", async () => {
    const store = createFakeStore();
    const wallet = ethers.Wallet.createRandom();
    const nonce = await generateNonce(store);
    const { message, signature } = await buildSignedSiwe(wallet, nonce, {
      expirationTime: null,
    });

    await expect(verifySignature(store, message, signature)).rejects.toBeInstanceOf(AuthError);
  });

  it("verifySignature rejects a message whose validity window is too long", async () => {
    const store = createFakeStore();
    const wallet = ethers.Wallet.createRandom();
    const nonce = await generateNonce(store);
    const now = Date.now();
    // issuedAt now, expirationTime 20 minutes out — beyond the 10-minute cap.
    const { message, signature } = await buildSignedSiwe(wallet, nonce, {
      issuedAt: new Date(now).toISOString(),
      expirationTime: new Date(now + 20 * 60 * 1000).toISOString(),
    });

    await expect(verifySignature(store, message, signature)).rejects.toBeInstanceOf(AuthError);
  });

  it("generateJWT + verify round-trip is handled by the middleware test below", () => {
    const token = generateJWT("0x0000000000000000000000000000000000000001");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature
  });
});

describe("auth.routes", () => {
  it("POST /auth/nonce returns a nonce", async () => {
    const store = createFakeStore();
    const app = await buildAuthApp(store);
    try {
      const res = await app.inject({ method: "POST", url: "/auth/nonce" });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { nonce: string };
      expect(typeof body.nonce).toBe("string");
      expect(body.nonce.length).toBeGreaterThanOrEqual(8);
    } finally {
      await app.close();
    }
  });

  it("POST /auth/verify with an invalid signature returns 401", async () => {
    const store = createFakeStore();
    const app = await buildAuthApp(store);
    try {
      const wallet = ethers.Wallet.createRandom();
      const attacker = ethers.Wallet.createRandom();
      const nonce = await generateNonce(store);
      const { message } = await buildSignedSiwe(wallet, nonce);
      const badSignature = await attacker.signMessage(message);

      const res = await app.inject({
        method: "POST",
        url: "/auth/verify",
        payload: { message, signature: badSignature },
      });

      expect(res.statusCode).toBe(401);
      expect((res.json() as { error: string }).error).toBe("Authentication failed");
    } finally {
      await app.close();
    }
  });

  it("POST /auth/verify with missing fields returns 400", async () => {
    const store = createFakeStore();
    const app = await buildAuthApp(store);
    try {
      const res = await app.inject({ method: "POST", url: "/auth/verify", payload: {} });
      expect(res.statusCode).toBe(400);
    } finally {
      await app.close();
    }
  });

  it("full HTTP flow: nonce -> sign -> verify returns a token", async () => {
    const store = createFakeStore();
    const app = await buildAuthApp(store);
    try {
      const nonceRes = await app.inject({ method: "POST", url: "/auth/nonce" });
      const { nonce } = nonceRes.json() as { nonce: string };

      const wallet = ethers.Wallet.createRandom();
      const { message, signature } = await buildSignedSiwe(wallet, nonce);

      const verifyRes = await app.inject({
        method: "POST",
        url: "/auth/verify",
        payload: { message, signature },
      });

      expect(verifyRes.statusCode).toBe(200);
      const body = verifyRes.json() as { token: string; address: string };
      expect(body.address).toBe(wallet.address);
      expect(body.token.split(".")).toHaveLength(3);
    } finally {
      await app.close();
    }
  });
});

describe("auth.middleware", () => {
  async function buildProtectedApp(): Promise<FastifyInstance> {
    const app = Fastify();
    app.get("/protected", { preHandler: [authenticate] }, async (request) => ({
      address: request.user?.address,
    }));
    await app.ready();
    return app;
  }

  it("allows a request with a valid token and exposes request.user", async () => {
    const app = await buildProtectedApp();
    try {
      const address = "0x0000000000000000000000000000000000000001";
      const token = generateJWT(address);
      const res = await app.inject({
        method: "GET",
        url: "/protected",
        headers: { authorization: `Bearer ${token}` },
      });

      expect(res.statusCode).toBe(200);
      expect((res.json() as { address: string }).address).toBe(address);
    } finally {
      await app.close();
    }
  });

  it("blocks a request with no token (401)", async () => {
    const app = await buildProtectedApp();
    try {
      const res = await app.inject({ method: "GET", url: "/protected" });
      expect(res.statusCode).toBe(401);
      expect((res.json() as { error: string }).error).toBe("Missing authorization token");
    } finally {
      await app.close();
    }
  });

  it("blocks a request with an invalid token (401)", async () => {
    const app = await buildProtectedApp();
    try {
      const res = await app.inject({
        method: "GET",
        url: "/protected",
        headers: { authorization: "Bearer not.a.real.jwt" },
      });
      expect(res.statusCode).toBe(401);
      expect((res.json() as { error: string }).error).toBe("Invalid or expired token");
    } finally {
      await app.close();
    }
  });
});
