// Script to migrate unit field from ObjectId back to unit name string
// Run this with: node scripts/migrate-unit-to-name.mjs

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

async function migrateUnitToName() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const itemsCollection = db.collection("items");
    const unitsCollection = db.collection("units");

    // Get all units and create a map of id -> name
    const units = await unitsCollection.find({}).toArray();
    const unitMap = {};
    units.forEach((unit) => {
      unitMap[unit._id.toString()] = unit.abbreviation || unit.name;
    });

    console.log("Unit map:", unitMap);

    // Find all items
    const items = await itemsCollection.find({}).toArray();

    let migratedCount = 0;

    for (const item of items) {
      let unitName = null;

      // Check if unit is an ObjectId object
      if (
        item.unit &&
        typeof item.unit === "object" &&
        item.unit._bsontype === "ObjectId"
      ) {
        const unitId = item.unit.toString();
        unitName = unitMap[unitId];
      }
      // Check if unit is a string that looks like an ObjectId (24 hex chars)
      else if (
        typeof item.unit === "string" &&
        /^[a-f0-9]{24}$/i.test(item.unit)
      ) {
        unitName = unitMap[item.unit];
      }

      if (unitName) {
        await itemsCollection.updateOne(
          { _id: item._id },
          { $set: { unit: unitName } }
        );
        console.log(
          `Migrated item: ${item.name} - unit changed to: ${unitName}`
        );
        migratedCount++;
      } else {
        console.log(
          `Skipped item: ${item.name} - unit: ${item.unit} (already a name or not found)`
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

migrateUnitToName();
