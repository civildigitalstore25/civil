import mongoose, { Schema, type Document } from 'mongoose';

export interface IBrandCategory {
  name: string;
  slug: string;
}

export interface IBrand extends Document {
  name: string;
  slug: string;
  categories: IBrandCategory[];
}

const categorySchema = new Schema<IBrandCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categories: { type: [categorySchema], default: [] },
  },
  { timestamps: true },
);

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
export default Brand;
