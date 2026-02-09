import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();

    // Get all orders with full details
    const orders = await Order.find().lean();
    const count = await Order.countDocuments();

    return NextResponse.json({
      success: true,
      totalOrders: count,
      orders: orders.map((order) => ({
        _id: order._id,
        orderId: order.orderId,
        customer: order.customer,
        items: order.items,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
