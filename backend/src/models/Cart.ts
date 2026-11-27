import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItem {
  id: string;
  productId: string;
  baseProductId: string;
  name: string;
  brand: string;
  category: string;
  license: string;
  image: string;
  format: string;
  fileSize: string;
  price: number;
  oldPrice: number;
  quantity: number;
  instantDownload: boolean;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    id: { type: String, required: true, trim: true },
    productId: { type: String, required: true, trim: true },
    baseProductId: { type: String, default: '', trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    license: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    format: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    price: { type: Number, required: true, default: 0, min: 0 },
    oldPrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    instantDownload: { type: Boolean, default: true },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;
