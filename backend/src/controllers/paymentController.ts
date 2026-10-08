import { randomBytes } from 'node:crypto';
import type { Response } from 'express';
import Coupon from '../models/Coupon.js';
import Order, { type IOrder, type OrderStatus, type PaymentState } from '../models/Order.js';
import Product from '../models/Product.js';
import { config } from '../config/index.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import {
  PhonePeError,
  createPhonePePayment,
  getPhonePeOrderStatus,
  phonepeConfigured,
} from '../services/phonepeService.js';
import { parseCartProductId, quoteAccessPlan, type CatalogPricing } from '../utils/accessPlans.js';

const MERCHANT_ORDER_PATTERN = /^[A-Za-z0-9_-]{3,63}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutItemInput {
  productId?: string;
  quantity?: number;
}

const presentOrder = (order: IOrder) => ({
  id: order.merchantOrderId,
  userId: order.userId ? String(order.userId) : 'guest_user',
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  customerPhone: order.customerPhone,
  shippingAddress: order.shippingAddress,
  items: order.items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    fileFormat: item.fileFormat,
  })),
  subtotal: order.subtotal,
  gst: order.gst,
  couponCode: order.couponCode,
  couponDiscount: order.couponDiscount,
  totalAmount: order.totalAmount,
  status: order.status,
  paymentState: order.paymentState,
  paymentMethod: order.paymentMethod,
  phonepeOrderId: order.phonepeOrderId || '',
  createdAt: order.createdAt.toISOString(),
});

const createMerchantOrderId = (): string => {
  const id = `CIV-${Date.now().toString(36)}-${randomBytes(6).toString('hex')}`.toUpperCase();
  return id.slice(0, 63);
};

const normalizePaymentState = (state: string): PaymentState | 'PENDING' => {
  if (state === 'COMPLETED') return 'COMPLETED';
  if (state === 'FAILED') return 'FAILED';
  return 'PENDING';
};

const statusForPayment = (state: PaymentState): OrderStatus => {
  if (state === 'COMPLETED') return 'Processing';
  if (state === 'FAILED') return 'Cancelled';
  return 'Pending';
};

const syncOrderWithPhonePe = async (order: IOrder): Promise<IOrder> => {
  if (order.paymentState !== 'PENDING' || order.amountPaise === 0) {
    return order;
  }

  const remote = await getPhonePeOrderStatus(order.merchantOrderId);
  const paymentState = normalizePaymentState(remote.state);
  if (
    paymentState === 'COMPLETED' &&
    typeof remote.amount === 'number' &&
    remote.amount !== order.amountPaise
  ) {
    throw new PhonePeError('PhonePe reported a different amount from this order.');
  }
  if (paymentState === 'PENDING') {
    if (remote.orderId && remote.orderId !== order.phonepeOrderId) {
      order.phonepeOrderId = remote.orderId;
      await order.save();
    }
    return order;
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentState: 'PENDING' },
    {
      $set: {
        paymentState,
        status: statusForPayment(paymentState),
        phonepeOrderId: remote.orderId || order.phonepeOrderId,
      },
    },
    { new: true }
  );

  if (!updated) {
    return (await Order.findById(order._id)) || order;
  }

  if (paymentState === 'COMPLETED' && updated.couponCode) {
    const claimed = await Order.findOneAndUpdate(
      { _id: updated._id, couponRedeemed: false },
      { $set: { couponRedeemed: true } }
    );
    if (claimed) {
      await Coupon.updateOne({ code: updated.couponCode }, { $inc: { usageCount: 1 } });
      updated.couponRedeemed = true;
    }
  }

  return updated;
};

const quoteCoupon = async (
  code: string,
  subtotal: number,
  productIds: string[]
): Promise<{ discount: number } | { error: string }> => {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return { error: 'Invalid coupon code' };
  if (coupon.status !== 'active') return { error: 'This coupon is currently inactive' };

  const now = new Date();
  if (now < new Date(coupon.validFrom)) return { error: 'This coupon is not yet active' };
  if (now > new Date(coupon.validTo)) return { error: 'This coupon has expired' };
  if (coupon.usageCount >= coupon.usageLimit) return { error: 'Coupon usage limit has been reached' };

  if ((coupon.applicableProducts || []).length > 0) {
    const eligible = productIds.some((id) => coupon.applicableProducts.includes(id));
    if (!eligible) return { error: 'This coupon is not applicable to the items in your cart' };
  }

  const discount =
    coupon.discountType === 'percentage'
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : Math.min(subtotal, coupon.discountValue);

  return { discount: Math.max(0, discount) };
};

export const initiatePhonePePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerName = String(req.body?.customerName || '').trim();
    const customerEmail = String(req.body?.customerEmail || '').trim().toLowerCase();
    const customerPhone = String(req.body?.customerPhone || '').trim();
    const shippingAddress = String(req.body?.shippingAddress || '').trim();
    const couponCode = String(req.body?.couponCode || '').trim();
    const items = Array.isArray(req.body?.items) ? (req.body.items as CheckoutItemInput[]) : [];

    if (!customerName || customerName.length > 80) {
      res.status(400).json({ message: 'Enter a valid full name.' });
      return;
    }
    if (!EMAIL_PATTERN.test(customerEmail)) {
      res.status(400).json({ message: 'Enter a valid email address.' });
      return;
    }
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      res.status(400).json({ message: 'Enter a valid phone number.' });
      return;
    }
    if (items.length === 0 || items.length > 30) {
      res.status(400).json({ message: 'Your cart is empty.' });
      return;
    }

    const selections: Array<{ productId: string; planId: string; quantity: number }> = [];
    for (const item of items) {
      const parsed = parseCartProductId(String(item.productId || '').trim());
      const quantity = Number(item.quantity);
      if (!parsed || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        res.status(400).json({ message: 'One or more cart items are invalid.' });
        return;
      }
      const existing = selections.find(
        (selection) => selection.productId === parsed.productId && selection.planId === parsed.planId,
      );
      if (existing) existing.quantity += quantity;
      else selections.push({ ...parsed, quantity });
    }

    const products = await Product.find({ _id: { $in: selections.map((selection) => selection.productId) } });
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = selections.map((selection) => {
      const product = productsById.get(selection.productId);
      if (!product || product.status !== 'active' || product.isOutOfStock) {
        throw new Error('One or more products are no longer available.');
      }
      const plan = quoteAccessPlan(product.toObject() as CatalogPricing, selection.planId);
      if (!plan) {
        throw new Error('The selected access option is no longer available.');
      }
      const title = selection.planId && selection.planId !== 'standard'
        ? `${product.name} (${plan.label})`
        : product.name;
      return {
        productId: selection.productId,
        title,
        price: plan.priceINR,
        quantity: selection.quantity,
        image: product.images?.[0] || '',
        fileFormat: product.format || '',
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let couponDiscount = 0;
    let appliedCoupon = '';
    if (couponCode) {
      const quote = await quoteCoupon(couponCode, subtotal, orderItems.map((item) => item.productId));
      if ('error' in quote) {
        res.status(400).json({ message: quote.error });
        return;
      }
      couponDiscount = quote.discount;
      appliedCoupon = couponCode.toUpperCase();
    }

    const netSubtotal = Math.max(0, subtotal - couponDiscount);
    const gst = Math.round(netSubtotal * 0.18);
    const totalAmount = netSubtotal + gst;
    const amountPaise = Math.round(totalAmount * 100);

    if (amountPaise > 0 && amountPaise < 100) {
      res.status(400).json({ message: 'PhonePe requires a minimum payable amount of ₹1.' });
      return;
    }

    if (amountPaise > 0 && !phonepeConfigured()) {
      res.status(503).json({
        message:
          'PhonePe test credentials are missing. Add PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, and PHONEPE_CLIENT_VERSION to backend/.env.local.',
      });
      return;
    }

    const merchantOrderId = createMerchantOrderId();
    const redirectUrl = `${config.frontendUrl.replace(/\/$/, '')}/payment/result/${merchantOrderId}`;
    const order = await Order.create({
      merchantOrderId,
      ...(req.user ? { userId: req.user._id } : {}),
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: orderItems,
      subtotal,
      couponCode: appliedCoupon,
      couponDiscount,
      gst,
      totalAmount,
      amountPaise,
      status: amountPaise === 0 ? 'Processing' : 'Pending',
      paymentState: amountPaise === 0 ? 'COMPLETED' : 'PENDING',
      paymentMethod: amountPaise === 0 ? 'Free' : 'PhonePe',
    });

    if (amountPaise === 0) {
      if (appliedCoupon) {
        await Coupon.updateOne({ code: appliedCoupon }, { $inc: { usageCount: 1 } });
        order.couponRedeemed = true;
        await order.save();
      }
      res.json({
        freeCheckout: true,
        merchantOrderId,
        redirectUrl,
        order: presentOrder(order),
      });
      return;
    }

    let payment: Awaited<ReturnType<typeof createPhonePePayment>>;
    try {
      payment = await createPhonePePayment({
        merchantOrderId,
        amountPaise,
        redirectUrl,
        message: `Civil Digital Store ${merchantOrderId}`.slice(0, 120),
      });
    } catch (paymentError) {
      order.paymentState = 'FAILED';
      order.status = 'Cancelled';
      await order.save();
      throw paymentError;
    }

    order.phonepeOrderId = payment.orderId;
    await order.save();

    res.json({
      merchantOrderId,
      redirectUrl: payment.redirectUrl,
      phonepeOrderId: payment.orderId,
      amount: totalAmount,
    });
  } catch (error) {
    if (error instanceof PhonePeError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes('available')) {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error('PhonePe initiate failed:', error);
    res.status(500).json({ message: 'Unable to start the payment. Please try again.' });
  }
};

export const getPhonePePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const merchantOrderId = String(req.params.merchantOrderId || '');
    if (!MERCHANT_ORDER_PATTERN.test(merchantOrderId)) {
      res.status(400).json({ message: 'Invalid payment reference.' });
      return;
    }

    const order = await Order.findOne({ merchantOrderId });
    if (!order) {
      res.status(404).json({ message: 'Payment not found.' });
      return;
    }

    const synced = await syncOrderWithPhonePe(order);
    res.json({ order: presentOrder(synced) });
  } catch (error) {
    if (error instanceof PhonePeError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    console.error('PhonePe status failed:', error);
    res.status(500).json({ message: 'Unable to confirm the payment status.' });
  }
};

export const phonePeWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = (req.body?.payload || req.body || {}) as { merchantOrderId?: string };
    const merchantOrderId = String(payload.merchantOrderId || '');
    if (!MERCHANT_ORDER_PATTERN.test(merchantOrderId)) {
      res.status(400).json({ message: 'Invalid payment reference.' });
      return;
    }

    const order = await Order.findOne({ merchantOrderId });
    if (!order) {
      res.status(404).json({ message: 'Payment not found.' });
      return;
    }

    await syncOrderWithPhonePe(order);
    res.json({ ok: true });
  } catch (error) {
    console.error('PhonePe webhook failed:', error);
    res.status(500).json({ message: 'Webhook processing failed.' });
  }
};

export const listMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const orders = await Order.find({
      $or: [{ userId: req.user._id }, { customerEmail: req.user.email.toLowerCase() }],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ orders: orders.map(presentOrder) });
  } catch (error) {
    console.error('List orders failed:', error);
    res.status(500).json({ message: 'Unable to load orders.' });
  }
};

export const listAdminOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
    res.json({ orders: orders.map(presentOrder) });
  } catch (error) {
    console.error('Admin list orders failed:', error);
    res.status(500).json({ message: 'Unable to load orders.' });
  }
};

export const updateAdminOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const merchantOrderId = String(req.params.merchantOrderId || '');
    const status = String(req.body?.status || '') as OrderStatus;
    const allowed: OrderStatus[] = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!MERCHANT_ORDER_PATTERN.test(merchantOrderId) || !allowed.includes(status)) {
      res.status(400).json({ message: 'Invalid order update.' });
      return;
    }

    const order = await Order.findOneAndUpdate(
      { merchantOrderId },
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    res.json({ order: presentOrder(order) });
  } catch (error) {
    console.error('Update order status failed:', error);
    res.status(500).json({ message: 'Unable to update the order.' });
  }
};
