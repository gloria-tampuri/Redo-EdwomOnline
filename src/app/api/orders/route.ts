import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders } from "@/app/services/orderService";
import { OrderDocument } from "@/models/Order";
import { generateOrderId } from "@/utils/orderId";
import { z } from "zod";

// Support both simplified checkout format and full admin format
const SimplifiedOrderSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string(),
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
      unit: z.string(),
      type: z.string().optional(),
    }),
  ),
  subtotal: z.number(),
  total: z.number(),
  status: z.string(),
});

// Delivery details format from delivery page
const DeliveryOrderSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string(),
        name: z.string().min(1, "Item name is required"),
        quantity: z.number().positive("Quantity must be positive"),
        price: z.number().positive("Price must be positive"),
        unit: z.string().min(1, "Unit is required"),
        type: z.string().optional(),
      }),
    )
    .min(1, "At least one item is required"),
  subtotal: z.number().positive("Subtotal must be positive"),
  total: z.number().positive("Total must be positive"),
  status: z.string(),
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
  }),
  deliveryLocation: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

const OrderSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }),
  items: z.array(
    z.object({
      name: z.string(),
      image: z.string().default(""),
      price: z.number(),
      quantity: z.number(),
      unit: z.string(),
    }),
  ),
  totalAmount: z.number(),
  deliveryLocation: z.string().optional(),
  status: z.string().optional(),
  orderDate: z.string().optional(),
  paymentStatus: z.string().optional(),
  assignedAdmin: z.string().optional(),
  deliveryDate: z.string().optional(),
  discount: z.number().optional(),
  deliveryFee: z.number().optional(),
  tax: z.number().optional(),
});

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Try delivery details format FIRST (from delivery page with customer info)
    const deliveryParsed = DeliveryOrderSchema.safeParse(body);
    if (deliveryParsed.success) {
      try {
        const data = deliveryParsed.data;
        console.log("Delivery order data received:", data); // Debug log
        const orderData: Partial<OrderDocument> = {
          orderId: generateOrderId(), // Generate orderId for user orders
          items: data.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
          })),
          status: data.status,
          subtotal: data.subtotal,
          total: data.total,
          totalAmount: data.total, // Use total as totalAmount for consistency
          customer: {
            name: data.customer.name || "",
            phone: data.customer.phone || "",
            email: data.customer.email || "",
            address: data.customer.address || "",
          },
          deliveryLocation: data.deliveryLocation,
          deliveryInstructions: data.deliveryInstructions,
          deliveryTime: data.deliveryTime,
          deliveryFee: 0,
          tax: 0,
        };

        console.log("Order data to save:", orderData); // Debug log

        // Convert deliveryDate to Date if provided
        if (data.deliveryDate) {
          const dateObj = new Date(data.deliveryDate);
          if (!isNaN(dateObj.getTime())) {
            orderData.deliveryDate = dateObj;
          }
        }

        const order = await createOrder(orderData);
        console.log("Order saved:", order); // Debug log
        return NextResponse.json(order, { status: 201 });
      } catch (error) {
        console.error("Delivery order creation error:", error);
        return NextResponse.json(
          {
            error: "Failed to create order",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // Try simplified format second (from checkout without customer details)
    const simplifiedParsed = SimplifiedOrderSchema.safeParse(body);
    if (simplifiedParsed.success) {
      try {
        const data = simplifiedParsed.data;
        const orderData: Partial<OrderDocument> = {
          orderId: generateOrderId(), // Generate orderId for user orders
          items: data.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
          })),
          status: data.status,
          subtotal: data.subtotal,
          total: data.total,
          totalAmount: data.total, // Use total as totalAmount for consistency
          deliveryFee: 0,
          tax: 0,
        };

        const order = await createOrder(orderData);
        return NextResponse.json(order, { status: 201 });
      } catch (error) {
        console.error("Simplified order creation error:", error);
        return NextResponse.json(
          {
            error: "Failed to create order",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // Try full format (from admin)
    const parsed = OrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid order data",
          details: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    try {
      // Fix: Ensure all required string fields are present
      const data = parsed.data;
      // Ensure customer fields are always present and not undefined
      const customer = {
        name: data.customer.name,
        phone: data.customer.phone ?? "",
        email: data.customer.email ?? "",
        address: data.customer.address ?? "",
      };
      const items = data.items.map((item) => ({
        ...item,
        image: item.image ?? "",
      }));

      // Build order data with proper types
      const orderData: Partial<OrderDocument> = {
        orderId: data.orderId,
        customer,
        items,
        totalAmount: data.totalAmount,
        deliveryLocation: data.deliveryLocation,
        status: data.status,
        paymentStatus: data.paymentStatus,
        discount: data.discount,
        deliveryFee: data.deliveryFee ?? 0,
        tax: data.tax ?? 0,
      };

      // Convert orderDate to Date if provided
      if (data.orderDate) {
        const dateObj = new Date(data.orderDate);
        if (!isNaN(dateObj.getTime())) {
          orderData.orderDate = dateObj;
        }
      }

      const order = await createOrder(orderData);
      return NextResponse.json(order, { status: 201 });
    } catch (error) {
      console.error("Admin order creation error:", error);
      return NextResponse.json(
        {
          error: "Failed to create order",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
