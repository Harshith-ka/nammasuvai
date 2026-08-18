import mongoose, { Schema, Document } from 'mongoose';

export interface IReview {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
}

export interface IPricingOption {
  weight: string;
  price: number;
  stock?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  subCategory?: string;
  images: string[];
  stock: number;
  weight: string;
  isOrganic: boolean;
  reviews: IReview[];
  rating: number;
  numReviews: number;
  isCuratedBasket?: boolean;
  basketItems?: string[];
  tag?: string;
  vendor?: mongoose.Types.ObjectId;
  supplier?: string;
  incomingToday?: number;
  incomingTomorrow?: number;
  pricingOptions?: IPricingOption[];
}

const ReviewSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String },
  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  weight: { type: String, required: true },
  isOrganic: { type: Boolean, default: true },
  reviews: [ReviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  isCuratedBasket: { type: Boolean, default: false },
  basketItems: [{ type: String }],
  tag: { type: String },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  supplier: { type: String, default: 'NammaSuvai Central Organics' },
  incomingToday: { type: Number, default: 15 },
  incomingTomorrow: { type: Number, default: 25 },
  pricingOptions: [{
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }
  }],
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);

