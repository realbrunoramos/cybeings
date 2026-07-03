function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireUpstashUrl(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Upstash Redis env vars missing: ${name} is required`);
  }
  if (!value.startsWith("https://")) {
    throw new Error(`Upstash Redis env vars missing: ${name} must start with https://`);
  }
  return value;
}

function requireUpstashToken(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Upstash Redis env vars missing: ${name} is required`);
  }
  return value;
}

function requireMongoUri(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  if (!value.startsWith("mongodb+srv://") && !value.startsWith("mongodb://")) {
    throw new Error(`${name} must start with mongodb+srv:// or mongodb://`);
  }
  return value;
}

export const env = {
  PORT: parseInt(requireEnv("PORT", "4000"), 10),
  HOST: requireEnv("HOST", "0.0.0.0"),
  CORS_ORIGINS: requireEnv("CORS_ORIGINS", "http://localhost:3000"),
  NODE_ENV: requireEnv("NODE_ENV", "development"),
  UPSTASH_REDIS_REST_URL: requireUpstashUrl("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: requireUpstashToken("UPSTASH_REDIS_REST_TOKEN"),
  MONGODB_URI: requireMongoUri("MONGODB_URI"),
} as const;

export type Env = typeof env;
