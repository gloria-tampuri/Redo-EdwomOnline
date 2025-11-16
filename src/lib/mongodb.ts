import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MongoURL || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Mongoose connection helper with caching for serverless / hot-reload environments.
 * Usage: await dbConnect();
 */
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = (global as any).__mongoose_cache || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // useNewUrlParser / useUnifiedTopology are default in Mongoose 6+
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  (global as any).__mongoose_cache = cached;
  return cached.conn;
}

export default dbConnect;