import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, deleteOrder } from '@/app/services/orderService';
import { OrderDocument } from '@/models/Order';
import mongoose from 'mongoose';
import { z } from 'zod';

const OrderUpdateSchema = z.object({
  orderId: z.string().optional(),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
  }).optional(),
  items: z.array(z.object({
    _id: z.string().optional(),
    name: z.string(),
    image: z.string().optional(),
    price: z.number(),
    quantity: z.number(),
    unit: z.string(),
  })).optional(),
  totalAmount: z.number().optional(),
  deliveryLocation: z.string().optional(),
  status: z.string().optional(),
  orderDate: z.string().optional(),
  paymentStatus: z.string().optional(),
  assignedAdmin: z.union([z.string(), z.any()]).optional(),
  deliveryDate: z.union([z.string(), z.date()]).optional(),
  discount: z.number().optional(),
  deliveryFee: z.number().optional(),
  tax: z.number().optional(),
});

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = OrderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update data', details: parsed.error }, { status: 400 });
    }
    // Build updateData with proper types
    const updateData: Partial<OrderDocument> = {};
    
    // Basic fields
    if (parsed.data.orderId !== undefined) updateData.orderId = parsed.data.orderId;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.paymentStatus !== undefined) updateData.paymentStatus = parsed.data.paymentStatus;
    if (parsed.data.discount !== undefined) updateData.discount = parsed.data.discount;
    if (parsed.data.deliveryFee !== undefined) updateData.deliveryFee = parsed.data.deliveryFee;
    if (parsed.data.tax !== undefined) updateData.tax = parsed.data.tax;
    if (parsed.data.totalAmount !== undefined) updateData.totalAmount = parsed.data.totalAmount;
    if (parsed.data.deliveryLocation !== undefined) updateData.deliveryLocation = parsed.data.deliveryLocation;
    if (parsed.data.orderDate !== undefined) {
      updateData.orderDate = new Date(parsed.data.orderDate);
    }
    
    // Customer object
    if (parsed.data.customer !== undefined) {
      updateData.customer = {
        name: parsed.data.customer.name,
        phone: parsed.data.customer.phone,
        email: parsed.data.customer.email,
        address: parsed.data.customer.address,
      };
    }
    
    // Convert assignedAdmin to ObjectId if present
    if (parsed.data.assignedAdmin && typeof parsed.data.assignedAdmin === 'string') {
      updateData.assignedAdmin = new mongoose.Types.ObjectId(parsed.data.assignedAdmin);
    }
    
    // Convert deliveryDate to Date if present
    if (parsed.data.deliveryDate) {
      if (typeof parsed.data.deliveryDate === 'string') {
        const dateObj = new Date(parsed.data.deliveryDate);
        if (!isNaN(dateObj.getTime())) {
          updateData.deliveryDate = dateObj;
        }
      } else if (parsed.data.deliveryDate instanceof Date) {
        updateData.deliveryDate = parsed.data.deliveryDate;
      }
    }
    
    // Map items with all fields including _id
    if (parsed.data.items && parsed.data.items.length > 0) {
      updateData.items = parsed.data.items.map(item => ({
        _id: item._id ? new mongoose.Types.ObjectId(item._id) : new mongoose.Types.ObjectId(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image ?? ''
      }));
    }
    
    const updated = await updateOrder(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
