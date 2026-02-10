const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

async function migrateOrdersCustomer() {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MongoURL;
    if (!mongoUri) {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const match = envContent.match(/^MONGODB_URI=(.*)$/m);
        if (match && match[1]) {
          mongoUri = match[1].trim();
        }
      }
    }

    if (!mongoUri) {
      console.error("❌ MONGODB_URI or MongoURL not found");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected");

    const orderItemSchema = new mongoose.Schema({
      name: { type: String, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
    });

    const customerSchema = new mongoose.Schema(
      {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        address: { type: String },
      },
      { _id: false, required: false },
    );

    const orderSchema = new mongoose.Schema({
      orderId: { type: String, sparse: true },
      customer: customerSchema,
      items: [orderItemSchema],
      totalAmount: { type: Number },
      subtotal: { type: Number },
      total: { type: Number },
      deliveryLocation: { type: String },
      status: { type: String, default: "pending" },
      orderDate: { type: Date, default: Date.now },
      paymentStatus: { type: String },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

    console.log("\n🔍 Searching for orders with missing customer data...");
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

    console.log(`📊 Found ${ordersToUpdate.length} orders\n`);

    if (ordersToUpdate.length === 0) {
      console.log("✅ All orders have complete customer data!");
    } else {
      let updatedCount = 0;
      const startTime = Date.now();

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
        const percentage = Math.round(
          (updatedCount / ordersToUpdate.length) * 100,
        );
        process.stdout.write(
          `\r✅ Updated: ${updatedCount}/${ordersToUpdate.length} (${percentage}%)`,
        );
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `\n\n🎉 Completed in ${duration}s! Updated ${updatedCount} orders.`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log("\n🔌 Connection closed");
    } catch (e) {
      // ignore
    }
  }
}

migrateOrdersCustomer();
