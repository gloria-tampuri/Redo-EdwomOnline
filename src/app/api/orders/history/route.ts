import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrdersByCustomerEmail } from "@/app/services/orderService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getOrdersByCustomerEmail(userEmail);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch user order history:", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 },
    );
  }
}
