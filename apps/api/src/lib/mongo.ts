import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

// Cache the client on globalThis outside production so tsx watch hot reloads
// reuse a single connection instead of leaking one client per reload.
// Connection happens in the Fastify plugin, not here.
const globalForMongo = globalThis as unknown as { mongo?: MongoClient };

export const mongo =
  globalForMongo.mongo ??
  new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

if (env.NODE_ENV !== "production") {
  globalForMongo.mongo = mongo;
}

export function mongoDb() {
  return mongo.db();
}

export default mongo;
