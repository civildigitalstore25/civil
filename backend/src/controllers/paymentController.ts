import { randomBytes } from 'node:crypto';
import type { Response } from 'express';
import { config } from '../config/index.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import Coupon from '../models/Coupon.js';
import Order, { type IOrder } from '../models/Order.js';
import Product from '../models/Product.js';
import { isDealActive, isFreeOfferActive } from '../utils/productSchedule.js';
import {
  PhonePeError,
  createPhonePePayment,
  getPhonePeOrderStatus,
  phonepeConfigured,
  phonepeMissingConfigMessage,
  extractWebhookMerchantOrderId,
} from '../services/phonepeService.js';
import { sendAdminOrderAlertEmail, sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/emailService.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MERCHANT_ORDER_PATTERN = /^[A-Za-z0-9_-]{3,63}$/;

const createMerchantOrderId = (): string =>
  `CIV-${Date.now().toString(36)}-${randomBytes(6).toString('hex')}`.toUpperCase().slice(0, 63);

const toAmount = (value: unknown): number => {
  const n = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Every INR price the catalogue currently allows (regular + plans, deal prices only while the deal is live). */
const allowedPricesFor = (product: any): Set<number> => {
  const prices = new Set<number>();
  const add = (v: unknown) => {
    const n = toAmount(v);
    if (n > 0) prices.add(Math.round(n * 100) / 100);
  };
  add(product.price);
  add(product.ebookPriceINR);
  add(product.lifetimePriceINR || product.lifetimePrice);
  add(product.membershipPriceINR || product.membershipPrice);
  const dealOn = isDealActive(product);
  if (dealOn) {
    add(product.dealEbookPriceINR);
    add(product.dealLifetimePriceINR);
    add(product.dealMembershipPriceINR);
  }
  const lists = [product.subscriptionDurations, product.subscriptions];
  if (dealOn) lists.push(product.dealSubscriptionDurations, product.dealSubscriptions);
  for (const list of lists) {
    for (const row of Array.isArray(list) ? list : []) {
      add(row?.priceINR || row?.price);
    }
  }
  return prices;
};

const findProduct = async (rawId: string) => {
  const baseId = rawId.split('::')[0] || '';
  if (/^[0-9a-fA-F]{24}$/.test(baseId)) {
    const byId = await Product.findById(baseId);
    if (byId) return byId;
  }
  return Product.findOne({ slug: baseId.toLowerCase() });
};

const presentOrder = (order: IOrder) => {
  const obj: any = order.toObject();
  obj.id = obj.orderId;
  obj.items = (obj.items || []).map((item: any) => {
    const hasDownload = Boolean(item.driveLink);
    delete item.driveLink;
    return { ...item, hasDownload };
  });
  return obj;
};

const quoteCoupon = async (code: string, subtotal: number, productIds: string[]) => {
  const coupon: any = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return { error: 'Invalid coupon code' };
  if (coupon.status && coupon.status !== 'active') return { error: 'This coupon is currently inactive' };
  const now = new Date();
  if (coupon.validFrom && now < new Date(coupon.validFrom)) return { error: 'This coupon is not yet active' };
  if (coupon.validTo && now > new Date(coupon.validTo)) return { error: 'This coupon has expired' };
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { error: 'Coupon usage limit has been reached' };
  }
  const applicable: string[] = coupon.applicableProducts || [];
  if (applicable.length > 0 && !productIds.some((id) => applicable.includes(id))) {
    return { error: 'This coupon is not applicable to the items in your cart' };
  }
  const discount =
    coupon.discountType === 'percentage'
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : Math.min(subtotal, coupon.discountValue);
  return { discount: Math.max(0, discount), code: coupon.code as string };
};

/**
 * Sends the customer confirmation + admin alert exactly once per order.
 * The flag is claimed atomically, so concurrent status checks / webhooks cannot double-send.
 * Never throws: email failures are logged and the order flow continues.
 */
export const notifyOrderPaid = async (order: IOrder): Promise<void> => {
  try {
    const claimed = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: 'Paid', confirmationEmailSent: { $ne: true } },
      { $set: { confirmationEmailSent: true } },
      { new: true }
    );
    if (!claimed) return;
    const data = claimed.toObject() as any;
    const [customerOk] = await Promise.all([sendOrderConfirmationEmail(data), sendAdminOrderAlertEmail(data)]);
    if (!customerOk) {
      // Release the claim so the next status check / webhook retries instead of silently giving up.
      await Order.updateOne({ _id: order._id }, { $set: { confirmationEmailSent: false } });
    }
  } catch (error) {
    console.error('[email] notifyOrderPaid failed:', error instanceof Error ? error.message : error);
  }
};

const markResult = async (
  order: IOrder,
  state: 'COMPLETED' | 'FAILED',
  phonepeOrderId?: string
): Promise<IOrder> => {
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: 'Pending' },
    {
      $set: {
        paymentStatus: state === 'COMPLETED' ? 'Paid' : 'Failed',
        status: state === 'COMPLETED' ? 'Completed' : 'Cancelled',
        ...(state === 'COMPLETED' ? { paidAt: new Date() } : {}),
        ...(phonepeOrderId ? { phonepeOrderId } : {}),
      },
    },
    { new: true }
  );
  if (updated && state === 'COMPLETED' && updated.couponCode) {
    await Coupon.updateOne({ code: updated.couponCode }, { $inc: { usageCount: 1 } });
  }
  if (updated && state === 'COMPLETED') {
    void notifyOrderPaid(updated);
  }
  // `updated` is only non-null on the Pending -> Failed transition, so this sends at most once.
  if (updated && state === 'FAILED') {
    void sendOrderStatusEmail(updated.toObject() as any, 'PaymentFailed');
  }
  return updated || (await Order.findById(order._id)) || order;
};

/** POST /api/payments/phonepe/initiate - creates a Pending order and returns the PhonePe checkout URL. */
export const initiatePhonePePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerName = String(req.body?.customerName || '').trim();
    const customerEmail = String(req.body?.customerEmail || '').trim().toLowerCase();
    const customerPhone = String(req.body?.customerPhone || '').trim();
    const shippingAddress = String(req.body?.shippingAddress || '').trim();
    const couponCode = String(req.body?.couponCode || '').trim();
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!customerName || customerName.length > 80) {
      res.status(400).json({ success: false, message: 'Enter a valid full name.' });
      return;
    }
    if (!EMAIL_PATTERN.test(customerEmail)) {
      res.status(400).json({ success: false, message: 'Enter a valid email address.' });
      return;
    }
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      res.status(400).json({ success: false, message: 'Enter a valid phone number.' });
      return;
    }
    if (items.length === 0 || items.length > 30) {
      res.status(400).json({ success: false, message: 'Your cart is empty.' });
      return;
    }

    const orderItems = [];
    for (const item of items) {
      const rawId = String(item?.productId || item?.id || '').trim();
      const quantity = Number(item?.quantity) || 1;
      const clientPrice = Math.round(Number(item?.price) * 100) / 100;
      const product: any = rawId ? await findProduct(rawId) : null;
      if (!product || product.status !== 'active' || product.isOutOfStock) {
        res.status(400).json({ success: false, message: 'One or more products are no longer available.' });
        return;
      }
      // Free offer is decided by the server: inside the window the item is ₹0 whatever the client sent.
      const freeNow = isFreeOfferActive(product);
      const price = freeNow ? 0 : clientPrice;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !Number.isFinite(price)) {
        res.status(400).json({ success: false, message: 'One or more cart items are invalid.' });
        return;
      }
      if (!freeNow && !allowedPricesFor(product).has(price)) {
        res.status(409).json({
          success: false,
          message: `The price of "${product.name}" has changed. Please remove it from your cart and add it again.`,
        });
        return;
      }
      orderItems.push({
        productId: product._id.toString(),
        title: String(item?.title || item?.name || product.name),
        price,
        quantity,
        image: item?.image || product.imageUrl || product.images?.[0] || '',
        fileFormat: item?.fileFormat || product.format || 'ZIP Download',
        driveLink: product.driveLink || '',
      });
    }

    const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    let couponDiscount = 0;
    let appliedCoupon = '';
    if (couponCode) {
      const quote = await quoteCoupon(couponCode, subtotal, orderItems.map((it) => it.productId));
      if ('error' in quote) {
        res.status(400).json({ success: false, message: quote.error });
        return;
      }
      couponDiscount = quote.discount;
      appliedCoupon = quote.code;
    }
    const netSubtotal = Math.max(0, subtotal - couponDiscount);
    const gst = Math.round(netSubtotal * 0.18);
    const totalAmount = netSubtotal + gst;
    const amountPaise = Math.round(totalAmount * 100);

    if (amountPaise > 0 && amountPaise < 100) {
      res.status(400).json({ success: false, message: 'PhonePe requires a minimum payable amount of Rs. 1.' });
      return;
    }
    if (amountPaise > 0 && !phonepeConfigured()) {
      res.status(503).json({
        success: false,
        message:
          phonepeMissingConfigMessage(),
      });
      return;
    }

    const merchantOrderId = createMerchantOrderId();
    const isFree = amountPaise === 0;
    const order = await Order.create({
      orderId: merchantOrderId,
      userId: req.user?._id?.toString() || 'guest_user',
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: orderItems,
      subtotal,
      gst,
      totalAmount,
      couponCode: appliedCoupon,
      couponDiscount,
      amountPaise,
      status: isFree ? 'Completed' : 'Pending',
      paymentMethod: isFree ? 'Free' : 'PhonePe',
      paymentStatus: isFree ? 'Paid' : 'Pending',
      ...(isFree ? { paidAt: new Date() } : {}),
    });

    const resultUrl = `${config.frontendUrl.replace(/\/$/, '')}/payment/result/${merchantOrderId}`;
    if (isFree) {
      void notifyOrderPaid(order);
      res.status(201).json({ success: true, merchantOrderId, freeCheckout: true, redirectUrl: resultUrl });
      return;
    }

    try {
      const payment = await createPhonePePayment({
        merchantOrderId,
        amountPaise,
        redirectUrl: resultUrl,
        message: `Civil Digital Store order ${merchantOrderId}`,
      });
      order.phonepeOrderId = payment.orderId;
      await order.save();
      res.status(201).json({
        success: true,
        merchantOrderId,
        redirectUrl: payment.redirectUrl,
        amount: totalAmount,
      });
    } catch (error) {
      order.paymentStatus = 'Failed';
      order.status = 'Cancelled';
      await order.save();
      throw error;
    }
  } catch (error: any) {
    console.error('PhonePe initiate failed:', error);
    const status = error instanceof PhonePeError ? error.status : 500;
    res.status(status).json({ success: false, message: error.message || 'Unable to start PhonePe payment.' });
  }
};

/** Asks PhonePe for the real result (never trusts the caller) and updates a Pending order. */
const syncWithPhonePe = async (order: IOrder): Promise<IOrder> => {
  if (order.paymentStatus !== 'Pending' || (order.amountPaise || 0) <= 0) return order;
  const remote = await getPhonePeOrderStatus(order.orderId);
  if (remote.state === 'COMPLETED') {
    if (typeof remote.amount === 'number' && remote.amount !== order.amountPaise) {
      throw new PhonePeError('PhonePe reported a different amount from this order.');
    }
    return markResult(order, 'COMPLETED', remote.orderId);
  }
  if (remote.state === 'FAILED') {
    return markResult(order, 'FAILED', remote.orderId);
  }
  return order;
};

/** GET /api/payments/phonepe/status/:merchantOrderId - verifies with PhonePe and updates the order. */
export const getPhonePePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const merchantOrderId = String(req.params.merchantOrderId || '');
    if (!MERCHANT_ORDER_PATTERN.test(merchantOrderId)) {
      res.status(400).json({ success: false, message: 'Invalid order reference.' });
      return;
    }
    let order: IOrder | null = await Order.findOne({ orderId: merchantOrderId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    order = await syncWithPhonePe(order);
    if (order.paymentStatus === 'Paid' && !order.confirmationEmailSent) void notifyOrderPaid(order);

    res.json({ success: true, order: presentOrder(order) });
  } catch (error: any) {
    console.error('PhonePe status check failed:', error);
    const status = error instanceof PhonePeError ? error.status : 500;
    res.status(status).json({ success: false, message: error.message || 'Unable to confirm payment status.' });
  }
};
/**
 * POST /api/payments/phonepe/webhook - PhonePe server-to-server notification.
 * The body is only used to find the order; the result is always re-verified with PhonePe.
 */
export const phonePeWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const merchantOrderId = extractWebhookMerchantOrderId(req.body);
    if (!MERCHANT_ORDER_PATTERN.test(merchantOrderId)) {
      res.status(400).json({ success: false, message: 'Invalid payment reference.' });
      return;
    }
    const order = await Order.findOne({ orderId: merchantOrderId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Payment not found.' });
      return;
    }
    const synced = await syncWithPhonePe(order);
    if (synced.paymentStatus === 'Paid' && !synced.confirmationEmailSent) void notifyOrderPaid(synced);
    res.json({ success: true });
  } catch (error) {
    console.error('PhonePe webhook failed:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed.' });
  }
};
