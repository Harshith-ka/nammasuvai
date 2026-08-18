import mongoose, { Schema, Document } from 'mongoose';

export interface IBankDetails {
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface IVendor extends Document {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  commissionRate: number;
  status: 'Active' | 'Inactive';
  bankDetails?: IBankDetails;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BankDetailsSchema = new Schema<IBankDetails>({
  accountNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  upiId: { type: String, default: '' },
}, { _id: false });

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
  companyName: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  commissionRate: { type: Number, required: true, default: 10 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  bankDetails: { type: BankDetailsSchema, default: () => ({}) },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IVendor>('Vendor', VendorSchema);
