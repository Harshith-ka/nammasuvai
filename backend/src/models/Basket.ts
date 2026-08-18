import mongoose, { Schema, Document } from 'mongoose';

export interface IBasketItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IBasket extends Document {
  user: mongoose.Types.ObjectId;
  items: IBasketItem[];
}

const BasketItemSchema: Schema = new Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 }
});

const BasketSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [BasketItemSchema]
}, { timestamps: true });

export default mongoose.model<IBasket>('Basket', BasketSchema);
