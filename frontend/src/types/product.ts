export type ProductCategory = 'Softwares' | 'Excel Sheets' | 'eBooks' | 'Projects';
export type SoftwareCompatibility = 'AutoCAD' | 'Revit' | 'SketchUp' | '3ds Max' | 'Lumion' | 'Tekla' | 'MS Office' | 'MS Project';

export interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  comment: string;
  verified: boolean;
}

export interface ProductSpecification {
  format: string;
  fileSize: string;
  software: string;
  version: string;
  compatibility: string;
  delivery: string;
  access: string;
}

export interface ProductCompatibilityInfo {
  supportedSoftware: string;
  compatibleVersions: string;
  os: string;
  fileTypes: string;
  requirements: string;
}

export interface Product {
  id: string;
  slug: string;
  categorySlug: string;
  aliases?: string[];
  name: string;
  category: ProductCategory;
  software: SoftwareCompatibility;
  format: string;
  fileSize: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  downloadsCount: number;
  badge?: 'Bestseller' | 'New' | 'Popular' | 'Hot';
  shortDescription: string;
  description: string[];
  includedFiles: string[];
  images: string[];
  specifications: ProductSpecification;
  compatibility: ProductCompatibilityInfo;
  reviews: Review[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt?: string;
  status?: 'active' | 'inactive';
  categoryId?: string;
  categoryName?: string;
}

export interface CustomerReview {
  id: string;
  userId?: string;
  userName: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  avatar?: string;
}


export interface FilterState {
  categories: ProductCategory[];
  software: SoftwareCompatibility[];
  fileFormats: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery: string;
}
