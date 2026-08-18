import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone: string;
  role: 'customer' | 'admin' | 'vendor';
  password?: string;
  isVerified?: boolean;
  wishlist?: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'admin', 'vendor'], default: 'customer' },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
