import { SiweMessage, generateNonce as siweGenerateNonce } from "siwe";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const NONCE_PREFIX = "siwe:nonce:";
const NONCE_TTL_SECONDS = 300; // 5 minutes
const JWT_EXPIRES_IN = "7d";

/**
 * Minimal surface of the Redis client the auth service relies on. Declaring it
 * as an interface (rather than importing the concrete Upstash type) lets the
 * service be unit-tested with an in-memory fake.
 */
export interface NonceStore {
  set(key: string, value: string, opts: { ex: number }): Promise<unknown>;
  get(key: string): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

export interface AuthTokenPayload {
  address: string;
}

/** Domain error for authentication failures. Never leak details to clients. */
export class AuthError extends Error {}

/** Generate a single-use nonce and store it in Redis with a short TTL. */
export async function generateNonce(store: NonceStore): Promise<string> {
  const nonce = siweGenerateNonce();
  await store.set(`${NONCE_PREFIX}${nonce}`, "pending", { ex: NONCE_TTL_SECONDS });
  return nonce;
}

/**
 * Verify a SIWE message + signature. Confirms the nonce exists (guards replay
 * and expiry), cryptographically verifies the signature, then consumes the
 * nonce. Returns the verified address on success; throws AuthError otherwise.
 */
export async function verifySignature(
  store: NonceStore,
  message: string,
  signature: string,
): Promise<string> {
  const siweMessage = new SiweMessage(message);
  const key = `${NONCE_PREFIX}${siweMessage.nonce}`;

  const stored = await store.get(key);
  if (stored === null || stored === undefined) {
    throw new AuthError("Invalid or expired nonce");
  }

  const result = await siweMessage.verify(
    { signature },
    { suppressExceptions: true },
  );
  if (!result.success) {
    throw new AuthError("Signature verification failed");
  }

  // Single-use nonce: consume it after a successful verification to prevent
  // replay attacks.
  await store.del(key);

  return siweMessage.address;
}

/** Sign a JWT carrying the verified wallet address. */
export function generateJWT(address: string): string {
  const payload: AuthTokenPayload = { address };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Verify a JWT and return its payload. Throws AuthError if invalid/expired. */
export function verifyJWT(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string" || typeof decoded.address !== "string") {
    throw new AuthError("Invalid token payload");
  }
  return { address: decoded.address };
}
