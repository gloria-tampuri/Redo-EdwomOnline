import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/app/services/orderService';
import { OrderDocument } from '@/models/Order';
import { z } from 'zod';

const OrderSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }),
  items: z.array(z.object({
    name: z.string(),
    image: z.string().default(''),
    price: z.number(),
    quantity: z.number(),
    unit: z.string(),
  })),
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
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data', details: parsed.error }, { status: 400 });
    }
    // Fix: Ensure all required string fields are present
    const data = parsed.data;
    // Ensure customer fields are always present and not undefined
    const customer = {
      name: data.customer.name,
      phone: data.customer.phone ?? '',
      email: data.customer.email ?? '',
      address: data.customer.address ?? '',
    };
    const items = data.items.map(item => ({
      ...item,
      image: item.image ?? ''
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
      deliveryFee: data.deliveryFee,
      tax: data.tax,
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
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
