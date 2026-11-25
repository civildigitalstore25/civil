export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand?: string;
  category: string;
  license?: string;
  image: string;
  format: string;
  fileSize: string;
  price: number;
  oldPrice: number;
  quantity: number;
  instantDownload: boolean;
}

export interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  description: string;
}

export interface CartSummary {
  subtotal: number;
  savings: number;
  gst: number;
  delivery: string;
  couponDiscount: number;
  totalPayable: number;
  totalItemsCount: number;
}

export interface AdminCartUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface AdminCartItem {
  id: string;
  productId: string;
  baseProductId: string;
  name: string;
  displayName: string;
  brand: string;
  category: string;
  license: string;
  image: string;
  format: string;
  fileSize: string;
  price: number;
  oldPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminCartRecord {
  id: string;
  user: AdminCartUser;
  items: AdminCartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
  createdAt: string;
}
