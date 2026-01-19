import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function checkItems() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected");

  const items = await mongoose.connection.db
    .collection("items")
    .find({})
    .toArray();
  items.forEach((item) => {
    console.log(
      `${item.name} - unit: "${
        item.unit
      }" (type: ${typeof item.unit}, isObjectId: ${
        item.unit?._bsontype === "ObjectId"
      })`
    );
  });

  await mongoose.disconnect();
}

checkItems();
