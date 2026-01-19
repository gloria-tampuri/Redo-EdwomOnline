// Script to migrate unit field from string to ObjectId
// Run this with: npx ts-node scripts/migrate-item-units.ts

import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

// Read .env.local file manually
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const MONGODB_URI = envVars.MONGODB_URI || envVars.MongoURL;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

async function migrateItemUnits() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const itemsCollection = db.collection("items");

    // Find all items where unit is a string (not ObjectId)
    const items = await itemsCollection.find({}).toArray();

    let migratedCount = 0;

    for (const item of items) {
      // Check if unit is a string that looks like an ObjectId
      if (
        typeof item.unit === "string" &&
        mongoose.Types.ObjectId.isValid(item.unit)
      ) {
        await itemsCollection.updateOne(
          { _id: item._id },
          { $set: { unit: new mongoose.Types.ObjectId(item.unit) } }
        );
        console.log(`Migrated item: ${item.name} - unit: ${item.unit}`);
        migratedCount++;
      }
    }

    console.log(`\nMigration complete! Migrated ${migratedCount} items.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migrateItemUnits();
