import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PackageItem {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitName?: string;
  price: number;
  image?: string;
}

export interface PackageDocument extends Document {
  name: string;
  description: string;
  items: PackageItem[];
  price: number;
  discount: number;
  status: 'active' | 'inactive';
  youtubeUrl?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PackageItemSchema = new Schema<PackageItem>({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitName: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
});

const PackageSchema = new Schema<PackageDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    items: [PackageItemSchema],
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    youtubeUrl: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

const Package = mongoose.models.Package || mongoose.model<PackageDocument>('Package', PackageSchema);

export default Package;
