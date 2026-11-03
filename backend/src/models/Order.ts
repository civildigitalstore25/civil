import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

export interface IOrderItem {
  id?: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  fileFormat?: string;
  driveLink?: string; // Private link stored internally
}

export interface IOrder extends Document {
  orderId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  items: IOrderItem[];
  subtotal: number;
  gst: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  downloadCount: number;
  couponCode?: string;
  couponDiscount?: number;
  amountPaise?: number;
  phonepeOrderId?: string;
  confirmationEmailSent?: boolean;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: '' },
    fileFormat: { type: String, default: 'ZIP Download' },
    driveLink: { type: String, default: '' },
  },
  { _id: true }
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: 'guest_user', index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    customerPhone: { type: String, default: '', trim: true },
    shippingAddress: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    gst: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
      default: 'Completed',
      index: true,
    },
    paymentMethod: { type: String, default: 'UPI / QR Code' },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Paid',
      index: true,
    },
    downloadCount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    amountPaise: { type: Number, default: 0 },
    phonepeOrderId: { type: String, default: '' },
    confirmationEmailSent: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;

