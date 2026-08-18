import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashSale extends Document {
  title: string;
  discountPercentage: number;
  endTime: Date;
  isActive: boolean;
  bannerText: string;
}

const FlashSaleSchema: Schema = new Schema({
  title: { type: String, required: true, default: 'Midnight Organic Flash Sale!' },
  discountPercentage: { type: Number, required: true, default: 15 },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  bannerText: { type: String, default: '⚡ FLASH SALE: Get 15% OFF on ALL Organic Products!' },
}, { timestamps: true });

export default mongoose.model<IFlashSale>('FlashSale', FlashSaleSchema);
