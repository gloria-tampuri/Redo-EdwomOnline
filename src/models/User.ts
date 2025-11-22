import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'super admin';
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema({
  id: { type: String },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: false, default: '' }, // Optional for OAuth users
  role: { type: String, enum: ['user', 'admin', 'super admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String, required: false, default: null },
  resetPasswordExpires: { type: Date, required: false, default: null },
  resetPasswordAttempts: { type: Number, required: false, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre<IUser>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;