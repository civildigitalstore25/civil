export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  fileFormat?: string;
}

export interface Order {
  id: string;
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
  createdAt: string;
}
