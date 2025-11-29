import mongoose, { Schema, Document, Types } from 'mongoose';

export interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface OrderDocument extends Document {
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryLocation: string;
  status: string;
  orderDate: Date;
  paymentStatus: string;
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

const OrderSchema = new Schema<OrderDocument>({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
  },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryLocation: { type: String },
  status: { type: String, default: 'Pending' },
  orderDate: { type: Date, default: Date.now },
  paymentStatus: { type: String, default: 'Unpaid' },
  assignedAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
  deliveryDate: { type: Date },
  discount: { type: Number },
  deliveryFee: { type: Number },
  tax: { type: Number },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);
