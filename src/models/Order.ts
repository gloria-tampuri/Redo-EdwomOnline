import mongoose, { Schema, Document, Types } from "mongoose";

export interface OrderItem {
  name: string;
  image?: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface OrderDocument extends Document {
  orderId?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: OrderItem[];
  totalAmount?: number;
  subtotal?: number;
  total?: number;
  deliveryLocation?: string;
  status: string;
  orderDate?: Date;
  paymentStatus?: string;
  assignedAdmin?: Types.ObjectId;
  deliveryDate?: Date;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
});

const CustomerSchema = new Schema(
  {
    name: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    address: { type: String, required: false },
  },
  { _id: false, required: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, sparse: true, required: false },
    customer: { type: CustomerSchema, required: false },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: false },
    subtotal: { type: Number, required: false },
    total: { type: Number, required: false },
    deliveryLocation: { type: String, required: false },
    status: { type: String, default: "pending", required: true },
    orderDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, required: false },
    assignedAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    deliveryDate: { type: Date },
    discount: { type: Number },
    deliveryFee: { type: Number },
    tax: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<OrderDocument>("Order", OrderSchema);
