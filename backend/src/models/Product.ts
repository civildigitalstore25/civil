import mongoose, { Schema, Document } from 'mongoose';
import { productCatalogFields } from './productCatalogFields.js';

export interface IKeyFeature {
  icon: string;
  title: string;
  description: string;
}

export interface IProduct extends Document {
  name: string;
  version?: string;
  slug: string;
  category: string;
  categorySlug: string;
  software: string;
  format: string;
  fileSize: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  downloadsCount: number;
  badge?: 'Bestseller' | 'New' | 'Popular' | 'Hot' | '';
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOutOfStock: boolean;
  status: 'active' | 'inactive' | 'draft';
  shortDescription: string;
  longDescription: string;
  detailsDescription: string;
  description: string[];
  includedFiles: string[];
  images: string[];
  specifications: {
    format: string;
    fileSize: string;
    software: string;
    version: string;
    compatibility: string;
    delivery: string;
    access: string;
  };
  compatibility: {
    supportedSoftware: string;
    compatibleVersions: string;
    os: string;
    fileTypes: string;
    requirements: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  keyFeatures?: IKeyFeature[];
  createdAt: Date;
  updatedAt: Date;
}

const keyFeatureSchema = new Schema<IKeyFeature>(
  {
    icon: { type: String, default: 'CheckCircle' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    version: { type: String, trim: true, default: '' },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, default: '' },
    categorySlug: { type: String, default: '' },
    software: { type: String, default: '' },
    format: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    oldPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    downloadsCount: { type: Number, default: 0 },
    badge: { type: String, default: '' },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
    shortDescription: { type: String, default: '' },
    longDescription: { type: String, default: '' },
    detailsDescription: { type: String, default: '' },
    description: { type: [String], default: [] },
    includedFiles: { type: [String], default: [] },
    images: { type: [String], default: [] },
    specifications: {
      format: { type: String, default: '' },
      fileSize: { type: String, default: '' },
      software: { type: String, default: '' },
      version: { type: String, default: '' },
      compatibility: { type: String, default: '' },
      delivery: { type: String, default: '' },
      access: { type: String, default: '' }
    },
    compatibility: {
      supportedSoftware: { type: String, default: '' },
      compatibleVersions: { type: String, default: '' },
      os: { type: String, default: '' },
      fileTypes: { type: String, default: '' },
      requirements: { type: String, default: '' }
    },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    keyFeatures: { type: [keyFeatureSchema], default: [] },
    ...productCatalogFields,
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
