import Order, { OrderDocument, OrderItem } from '@/models/Order';
import dbConnect from '@/lib/mongodb';

export async function createOrder(data: Partial<OrderDocument>) {
  await dbConnect();
  const order = new Order(data);
  await order.save();
  return order;
}

export async function getOrders() {
  await dbConnect();
  return Order.find().sort({ orderDate: -1 });
}

export async function getOrderById(id: string) {
  await dbConnect();
  return Order.findById(id);
}

export async function updateOrder(id: string, data: Partial<OrderDocument>) {
  await dbConnect();
  return Order.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteOrder(id: string) {
  await dbConnect();
  return Order.findByIdAndDelete(id);
}
