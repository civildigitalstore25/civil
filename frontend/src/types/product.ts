export type ProductCategory = 'Softwares' | 'Excel Sheets' | 'eBooks' | 'Projects' | string;
export type SoftwareCompatibility = 'AutoCAD' | 'Revit' | 'SketchUp' | '3ds Max' | 'Lumion' | 'Tekla' | 'MS Office' | 'MS Project' | string;

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

export type SubscriptionDuration = {
  duration: string;
  price: string;
  priceINR: string;
  priceUSD: string;
  trialDays?: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type Feature = {
  icon: string;
  title: string;
  description: string;
};

export type Requirement = {
  icon: string;
  title: string;
  description: string;
};

export type KeyFeature = Feature;

export type ProductForm = {
  name: string;
  version: string;
  slug: string;

  longDescription: string;
  detailsDescription: string;

  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;

  category: string;
  brand: string;

  subscriptionDurations: SubscriptionDuration[];

  ebookPriceINR: string;
  ebookPriceUSD: string;

  subscriptions: SubscriptionDuration[];

  hasLifetime: boolean;
  lifetimePrice: string;
  lifetimePriceINR: string;
  lifetimePriceUSD: string;

  hasMembership: boolean;
  membershipPrice: string;
  membershipPriceINR: string;
  membershipPriceUSD: string;

  strikethroughPriceINR: string;
  strikethroughPriceUSD: string;

  imageUrl: string;
  additionalImages: string[];

  videoUrl: string;
  activationVideoUrl: string;
  instagramReels: string[];
  driveLink: string;

  status: "active" | "inactive" | "draft";
  isBestSeller: boolean;
  isOutOfStock: boolean;

  faqs: FAQ[];
  keyFeatures: Feature[];
  systemRequirements: Requirement[];

  isDeal: boolean;
  dealStartDate: string;
  dealStartTime: string;
  dealEndDate: string;
  dealEndTime: string;

  dealEbookPriceINR: string;
  dealEbookPriceUSD: string;

  dealLifetimePriceINR: string;
  dealLifetimePriceUSD: string;

  dealMembershipPriceINR: string;
  dealMembershipPriceUSD: string;

  dealSubscriptionDurations: SubscriptionDuration[];
  dealSubscriptions: SubscriptionDuration[];

  isFreeProduct: boolean;
  freeProductStartDate: string;
  freeProductStartTime: string;
  freeProductEndDate: string;
  freeProductEndTime: string;
};

export interface Product {
  id: string;
  _id?: string;
  slug: string;
  categorySlug: string;
  aliases?: string[];
  name: string;
  version?: string;
  category: ProductCategory;
  software: SoftwareCompatibility;
  brand?: string;
  company?: string;
  format: string;
  fileSize: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  downloadsCount: number;
  badge?: 'Bestseller' | 'New' | 'Popular' | 'Hot' | '';
  shortDescription: string;
  longDescription?: string;
  detailsDescription?: string;
  description: string[];
  includedFiles: string[];
  images: string[];
  specifications: ProductSpecification;
  compatibility: ProductCompatibilityInfo;
  reviews: Review[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isOutOfStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'inactive' | 'draft';
  categoryId?: string;
  categoryName?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  subscriptionDurations?: SubscriptionDuration[];
  subscriptions?: SubscriptionDuration[];
  ebookPriceINR?: string;
  ebookPriceUSD?: string;
  hasLifetime?: boolean;
  lifetimePrice?: string;
  lifetimePriceINR?: string;
  lifetimePriceUSD?: string;
  hasMembership?: boolean;
  membershipPrice?: string;
  membershipPriceINR?: string;
  membershipPriceUSD?: string;
  strikethroughPriceINR?: string;
  strikethroughPriceUSD?: string;
  imageUrl?: string;
  additionalImages?: string[];
  videoUrl?: string;
  activationVideoUrl?: string;
  instagramReels?: string[];
  driveLink?: string;
  faqs?: FAQ[];
  keyFeatures?: Feature[];
  systemRequirements?: Requirement[];
  isDeal?: boolean;
  dealStartDate?: string;
  dealStartTime?: string;
  dealEndDate?: string;
  dealEndTime?: string;
  dealEbookPriceINR?: string;
  dealEbookPriceUSD?: string;
  dealLifetimePriceINR?: string;
  dealLifetimePriceUSD?: string;
  dealMembershipPriceINR?: string;
  dealMembershipPriceUSD?: string;
  dealSubscriptionDurations?: SubscriptionDuration[];
  dealSubscriptions?: SubscriptionDuration[];
  isFreeProduct?: boolean;
  freeProductStartDate?: string;
  freeProductStartTime?: string;
  freeProductEndDate?: string;
  freeProductEndTime?: string;
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

