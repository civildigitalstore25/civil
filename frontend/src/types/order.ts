export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface OrderItem {
  id?: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  fileFormat?: string;
  hasDownload?: boolean;
}

export interface Order {
  id: string;
  orderId?: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  couponCode?: string;
  couponDiscount?: number;
  phonepeOrderId?: string;
}
