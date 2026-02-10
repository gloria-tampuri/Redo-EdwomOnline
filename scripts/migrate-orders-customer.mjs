import mongoose from "mongoose";
import Order from "../src/models/Order.js";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MongoURL;

if (!MONGODB_URI) {
  console.error(
    "Error: Please define MONGODB_URI or MongoURL environment variable",
  );
  process.exit(1);
}

async function migrateOrdersCustomer() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all orders where customer is missing or incomplete
    console.log("🔍 Searching for orders with missing customer data...");
    const ordersToUpdate = await Order.find({
      $or: [
        { customer: null },
        { customer: undefined },
        { "customer.name": { $exists: false } },
        { "customer.phone": { $exists: false } },
        { "customer.email": { $exists: false } },
        { "customer.address": { $exists: false } },
      ],
    });

    console.log(`📊 Found ${ordersToUpdate.length} orders to update`);

    if (ordersToUpdate.length === 0) {
      console.log("✅ All orders already have complete customer data!");
    } else {
      // Update each order to ensure customer object has all fields
      let updatedCount = 0;
      for (const order of ordersToUpdate) {
        const updatedCustomer = {
          name: order.customer?.name || "",
          phone: order.customer?.phone || "",
          email: order.customer?.email || "",
          address: order.customer?.address || "",
        };

        await Order.findByIdAndUpdate(
          order._id,
          { customer: updatedCustomer },
          { new: true },
        );

        updatedCount++;
        console.log(
          `✅ Updated order ${order._id || order.orderId} (${updatedCount}/${ordersToUpdate.length})`,
        );
      }
      console.log(
        `\n🎉 Migration completed successfully! Updated ${updatedCount} orders.`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

migrateOrdersCustomer();
