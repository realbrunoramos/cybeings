function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: parseInt(requireEnv("PORT", "4000"), 10),
  HOST: requireEnv("HOST", "0.0.0.0"),
  CORS_ORIGINS: requireEnv("CORS_ORIGINS", "http://localhost:3000"),
  NODE_ENV: requireEnv("NODE_ENV", "development"),
} as const;

export type Env = typeof env;
