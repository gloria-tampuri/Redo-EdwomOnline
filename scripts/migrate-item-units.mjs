// Script to migrate unit field from string to ObjectId
// Run this with: node scripts/migrate-item-units.mjs

import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local file manually
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const eqIndex = line.indexOf("=");
  if (eqIndex > 0) {
    const key = line.substring(0, eqIndex).trim();
    const value = line.substring(eqIndex + 1).trim();
    envVars[key] = value;
  }
});

const MONGODB_URI = envVars.MONGODB_URI || envVars.MongoURL;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

async function migrateItemUnits() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const itemsCollection = db.collection("items");

    // Find all items
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
      } else {
        console.log(
          `Skipped item: ${item.name} - unit already ObjectId or invalid`
        );
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
