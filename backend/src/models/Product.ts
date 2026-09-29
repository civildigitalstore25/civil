import mongoose, { Schema, Document } from 'mongoose';

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
    category: { type: String, required: true, default: 'Softwares' },
    categorySlug: { type: String, required: true, default: 'softwares' },
    software: { type: String, required: true, default: 'AutoCAD' },
    format: { type: String, default: 'ZIP' },
    fileSize: { type: String, default: '100 MB' },
    price: { type: Number, required: true, default: 0 },
    oldPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 1 },
    downloadsCount: { type: Number, default: 0 },
    badge: { type: String, default: 'New' },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
    shortDescription: { type: String, default: '' },
    longDescription: { type: String, default: '' },
    detailsDescription: { type: String, default: '' },
    description: { type: [String], default: [] },
    includedFiles: { type: [String], default: ['Digital Download Files'] },
    images: { type: [String], default: [] },
    specifications: {
      format: { type: String, default: 'ZIP' },
      fileSize: { type: String, default: '100 MB' },
      software: { type: String, default: 'AutoCAD' },
      version: { type: String, default: 'Latest' },
      compatibility: { type: String, default: 'Windows 10/11' },
      delivery: { type: String, default: 'Instant Digital Download' },
      access: { type: String, default: 'Lifetime Unlimited' }
    },
    compatibility: {
      supportedSoftware: { type: String, default: 'AutoCAD' },
      compatibleVersions: { type: String, default: 'All Recent Versions' },
      os: { type: String, default: 'Windows 10 / 11 (64-bit)' },
      fileTypes: { type: String, default: 'ZIP' },
      requirements: { type: String, default: '4GB RAM' }
    },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    keyFeatures: { type: [keyFeatureSchema], default: [] }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
