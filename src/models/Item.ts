import mongoose, { Document, Schema } from 'mongoose';

interface ItemDocument extends Document {
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  discount?: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  image?: string; // Base64 encoded image
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<ItemDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Low Stock'],
      default: 'In Stock',
    },
    image: {
      type: String,
      default: '',
    },
    lastUpdated: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to update lastUpdated
ItemSchema.pre<ItemDocument>('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

const Item = mongoose.models.Item || mongoose.model<ItemDocument>('Item', ItemSchema);

export default Item;
export type { ItemDocument };
