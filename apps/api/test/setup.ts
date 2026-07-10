// Provide the env vars that src/config/env.ts validates at import time, so
// tests never depend on a real .env being present.
process.env.NODE_ENV ??= "test";
process.env.JWT_SECRET ??= "test-jwt-secret-that-is-at-least-32-characters-long";
process.env.UPSTASH_REDIS_REST_URL ??= "https://dummy.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN ??= "dummy";
process.env.MONGODB_URI ??= "mongodb://localhost:27017/test";
