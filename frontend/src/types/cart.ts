export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
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
