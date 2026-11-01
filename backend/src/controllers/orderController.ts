import type { Response } from 'express';
import { type AuthRequest } from '../middlewares/authMiddleware.js';
import Order, { type IOrder, type OrderStatus } from '../models/Order.js';
import Product from '../models/Product.js';

const sanitizeOrderItem = (item: any, isAdmin: boolean) => {
  const obj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
  if (!isAdmin) {
    delete obj.driveLink;
  }
  obj.hasDownload = Boolean(item.driveLink);
  return obj;
};

const sanitizeOrder = (order: any, isAdmin = false) => {
  if (!order) return null;
  const obj = typeof order.toObject === 'function' ? order.toObject() : { ...order };
  obj.items = (obj.items || []).map((item: any) => sanitizeOrderItem(item, isAdmin));
  return obj;
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      id: customId,
      orderId: incomingOrderId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      gst,
      totalAmount,
      paymentMethod,
    } = req.body;

    if (!customerEmail || !customerName) {
      res.status(400).json({ success: false, message: 'Customer name and email are required' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must contain at least one item' });
      return;
    }

    const orderId =
      String(incomingOrderId || customId || '').trim() ||
      `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check if order already exists in database
    const existing = await Order.findOne({ orderId });
    if (existing) {
      res.status(200).json({
        success: true,
        order: sanitizeOrder(existing, false),
      });
      return;
    }

    // Attach driveLink securely from the product catalogue to each ordered item snapshot
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        let driveLink = item.driveLink || '';
        let foundProductId = String(item.productId || item.id || '');

        if (!driveLink && foundProductId) {
          let product: any = null;
          if (/^[0-9a-fA-F]{24}$/.test(foundProductId)) {
            product = await Product.findById(foundProductId).select('driveLink');
          }
          if (!product) {
            product = await Product.findOne({ slug: foundProductId }).select('driveLink');
          }
          if (!product && item.title) {
            product = await Product.findOne({ name: item.title }).select('driveLink');
          }
          if (product?.driveLink) {
            driveLink = product.driveLink;
          }
          if (product?._id) {
            foundProductId = product._id.toString();
          }
        }

        return {
          productId: foundProductId,
          title: String(item.title || item.name || 'Digital Product'),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || item.imageUrl || '',
          fileFormat: item.fileFormat || item.format || 'ZIP Download',
          driveLink,
        };
      })
    );

    const userId = req.user?._id?.toString() || req.body.userId || 'guest_user';

    const newOrder = await Order.create({
      orderId,
      userId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: (customerPhone || '').trim(),
      shippingAddress: (shippingAddress || '').trim(),
      items: enrichedItems,
      subtotal: Number(subtotal) || 0,
      gst: Number(gst) || 0,
      totalAmount: Number(totalAmount) || 0,
      status: 'Completed', // Digital purchases are completed instantly
      paymentMethod: paymentMethod || 'UPI / QR Code',
      paymentStatus: 'Paid',
    });

    res.status(201).json({
      success: true,
      order: sanitizeOrder(newOrder, false),
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
      error,
    });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const orders = await Order.find({
      $or: [
        { userId: user._id.toString() },
        { customerEmail: user.email.toLowerCase() },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map((o) => sanitizeOrder(o, false)),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message,
    });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idOrOrderId = String(req.params.id || '').trim();
    if (!idOrOrderId) {
      res.status(400).json({ success: false, message: 'Order ID is required' });
      return;
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(idOrOrderId);
    const filter: Record<string, any> = isMongoId
      ? { $or: [{ orderId: idOrOrderId }, { _id: idOrOrderId }] }
      : { orderId: idOrOrderId };

    const order = await Order.findOne(filter);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const isOwner =
      req.user &&
      (order.userId === req.user._id.toString() ||
        order.customerEmail.toLowerCase() === req.user.email.toLowerCase());

    if (!isAdmin && !isOwner) {
      res.status(403).json({ success: false, message: 'Access denied to this order' });
      return;
    }

    res.json({
      success: true,
      order: sanitizeOrder(order, isAdmin),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
};

export const getAdminOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, page = 1, limit = 100 } = req.query;
    const filter: Record<string, any> = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { orderId: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { customerPhone: searchRegex },
      ];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit) || 100);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      orders: orders.map((o) => sanitizeOrder(o, true)),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin orders', error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idOrOrderId = String(req.params.id || '').trim();
    const { status } = req.body;

    const validStatuses: OrderStatus[] = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid order status' });
      return;
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(idOrOrderId);
    const filter: Record<string, any> = isMongoId
      ? { $or: [{ orderId: idOrOrderId }, { _id: idOrOrderId }] }
      : { orderId: idOrOrderId };

    const order = await Order.findOneAndUpdate(
      filter,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: sanitizeOrder(order, true),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};
