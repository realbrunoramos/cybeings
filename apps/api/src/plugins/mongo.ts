import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { Db, MongoClient } from "mongodb";
import { MongoServerError } from "mongodb";
import { mongo, mongoDb } from "../lib/mongo.js";

declare module "fastify" {
  interface FastifyInstance {
    mongo: MongoClient;
    mongoDb: Db;
  }
}

const NAMESPACE_EXISTS_ERROR_CODE = 48;
const AI_LOGS_TTL_SECONDS = 90 * 24 * 60 * 60;

async function ensureCollection(db: Db, name: string): Promise<void> {
  try {
    await db.createCollection(name);
  } catch (err) {
    if (err instanceof MongoServerError && err.code === NAMESPACE_EXISTS_ERROR_CODE) {
      return;
    }
    throw err;
  }
}

async function ensureCollectionsAndIndexes(db: Db): Promise<void> {
  await ensureCollection(db, "cybeing_chats");
  await ensureCollection(db, "world_events");
  await ensureCollection(db, "ai_logs");

  await db
    .collection("cybeing_chats")
    .createIndex({ cybeingId: 1, createdAt: -1 });

  await db.collection("world_events").createIndex({ type: 1, createdAt: -1 });

  await db
    .collection("ai_logs")
    .createIndex({ createdAt: -1 }, { expireAfterSeconds: AI_LOGS_TTL_SECONDS });
}

// Fail fast: if $connect or the sanity ping rejects, the error propagates
// and the server never starts listening.
export const mongoPlugin = fp(async (app: FastifyInstance): Promise<void> => {
  await mongo.connect();
  const db = mongoDb();
  await db.command({ ping: 1 });
  await ensureCollectionsAndIndexes(db);
  app.log.info("MongoDB connected");

  app.decorate("mongo", mongo);
  app.decorate("mongoDb", db);

  app.addHook("onClose", async () => {
    await mongo.close();
  });
});
