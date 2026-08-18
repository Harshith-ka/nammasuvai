import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText: string;
  isActive: boolean;
}

const bannerSchema = new Schema<IBanner>({
  title: {
    type: String,
    required: true,
    default: "Fresh Monsoon Harvest",
  },
  subtitle: {
    type: String,
    required: true,
    default: "Get up to 30% off on all leafy greens delivered within 12 hours.",
  },
  imageUrl: {
    type: String,
    required: true,
    default: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=1200&auto=format&fit=crop",
  },
  badgeText: {
    type: String,
    required: true,
    default: "Flash Sale",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IBanner>('Banner', bannerSchema);
