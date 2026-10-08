import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
export type PaymentState = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  fileFormat?: string;
}

export interface IOrder extends Document {
  merchantOrderId: string;
  phonepeOrderId?: string;
  userId?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: IOrderItem[];
  subtotal: number;
  couponCode: string;
  couponDiscount: number;
  couponRedeemed: boolean;
  gst: number;
  totalAmount: number;
  amountPaise: number;
  status: OrderStatus;
  paymentState: PaymentState;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
    fileFormat: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    merchantOrderId: { type: String, required: true, unique: true, index: true },
    phonepeOrderId: { type: String, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    shippingAddress: { type: String, default: '', trim: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: '', uppercase: true, trim: true },
    couponDiscount: { type: Number, default: 0, min: 0 },
    couponRedeemed: { type: Boolean, default: false },
    gst: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaise: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    paymentState: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    paymentMethod: { type: String, default: 'PhonePe' },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ customerEmail: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
