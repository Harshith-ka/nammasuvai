import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
  customizations?: string[];
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: mongoose.Types.ObjectId;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paytmOrderId?: string;
  paytmTxnToken?: string;
  paytmPaymentId?: string;
  paytmSignature?: string;
  couponCode?: string;
  discountPrice?: number;
  flashSaleApplied?: boolean;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  orderStatus: 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  deliveredAt?: Date;
  zohoBookId?: string;
  zohoSyncStatus?: 'Synced' | 'Pending' | 'Failed';
  zohoSyncedAt?: Date;
  isStockDeducted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  weight: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  customizations: [{ type: String }],
});

const OrderSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [OrderItemSchema],
  shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paytmOrderId: { type: String },
  paytmTxnToken: { type: String },
  paytmPaymentId: { type: String },
  paytmSignature: { type: String },
  couponCode: { type: String },
  discountPrice: { type: Number, default: 0.0 },
  flashSaleApplied: { type: Boolean, default: false },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  orderStatus: { 
    type: String, 
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Pending', 'Processing'],
    default: 'Placed'
  },
  deliveredAt: { type: Date },
  zohoBookId: { type: String },
  zohoSyncStatus: { 
    type: String, 
    enum: ['Synced', 'Pending', 'Failed'],
    default: 'Pending'
  },
  zohoSyncedAt: { type: Date },
  isStockDeducted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
