import mongoose, { Schema, type Document } from 'mongoose';

export type BannerSlot = 'left' | 'right';

export interface IBanner extends Document {
  slot: BannerSlot;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
}

const bannerSchema = new Schema<IBanner>(
  {
    slot: { type: String, enum: ['left', 'right'], required: true },
    imageUrl: { type: String, required: true, trim: true },
    linkUrl: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
export default Banner;
