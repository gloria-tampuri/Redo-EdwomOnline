import mongoose, { Document, Schema } from 'mongoose';

export interface UnitDocument extends Document {
  name: string;
  abbreviation: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<UnitDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Unit = mongoose.models.Unit || mongoose.model<UnitDocument>('Unit', UnitSchema);

export default Unit;
