import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { type AuthRequest } from '../middlewares/authMiddleware.js';
import { config } from '../config/index.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import googleDriveService from '../services/googleDriveService.js';

interface DownloadJwtPayload {
  orderId: string;
  productId: string;
  fileId: string;
  fileName?: string | undefined;
}

export const generateDownloadToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, productId, customerEmail } = req.body;

    if (!orderId || !productId) {
      res.status(400).json({ success: false, message: 'orderId and productId are required' });
      return;
    }

    const cleanId = String(orderId).trim();
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(cleanId);

    // 1. Find the order in MongoDB
    let order = await Order.findOne(
      isMongoId ? { $or: [{ orderId: cleanId }, { _id: cleanId }] } : { orderId: cleanId }
    );

    // 2. Not found by reference (e.g. a stale local-storage id). NEVER create an order from client
    //    data here - that would let anyone mint a "Paid" order. Instead, for a signed-in user, look up
    //    an existing PAID order of theirs that contains this product. Guests must use a real order id.
    if (!order && req.user) {
      const pid = String(productId).trim();
      const productIds = [pid];
      const prod: any = /^[0-9a-fA-F]{24}$/.test(pid)
        ? await Product.findById(pid).select('_id slug')
        : await Product.findOne({ slug: pid.toLowerCase() }).select('_id slug');
      if (prod?._id) productIds.push(prod._id.toString());
      if (prod?.slug) productIds.push(prod.slug);
      order = await Order.findOne({
        $or: [{ userId: req.user._id.toString() }, { customerEmail: req.user.email.toLowerCase() }],
        paymentStatus: 'Paid',
        'items.productId': { $in: productIds },
      }).sort({ createdAt: -1 });
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // 3. Verify permission: logged in owner, customer email match, or admin
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const isOwner =
      req.user &&
      (order.userId === req.user._id.toString() ||
        order.customerEmail.toLowerCase() === req.user.email.toLowerCase());
    const isGuestMatch =
      !req.user &&
      customerEmail &&
      customerEmail.trim().toLowerCase() === order.customerEmail.toLowerCase();

    // Guest orders require the matching customer email; the order reference alone is not enough.
    if (!isAdmin && !isOwner && !isGuestMatch) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to download files for this order',
      });
      return;
    }

    // Check payment / order status
    // Paid orders (including server-verified ₹0 free orders, which are marked Paid) unlock downloads.
    // Cancelled/refunded orders do not, even if they were paid earlier.
    if (!isAdmin && (order.paymentStatus !== 'Paid' || order.status === 'Cancelled')) {
      res.status(403).json({
        success: false,
        message: 'Download is only available after payment is completed',
      });
      return;
    }

    // 4. Find the purchased item in this order
    const cleanProductId = String(productId).trim();
    let item = order.items.find(
      (it) =>
        it.productId === cleanProductId ||
        (it.id && it.id === cleanProductId) ||
        ((it as any)._id && (it as any)._id.toString() === cleanProductId)
    );

    if (!item) {
      // Also try matching via product slug or title
      let targetProduct: any = null;
      if (/^[0-9a-fA-F]{24}$/.test(cleanProductId)) {
        targetProduct = await Product.findById(cleanProductId);
      }
      if (!targetProduct) {
        targetProduct = await Product.findOne({ slug: cleanProductId });
      }

      if (targetProduct) {
        item = order.items.find(
          (it) =>
            it.productId === targetProduct._id.toString() ||
            it.productId === targetProduct.slug ||
            it.title.toLowerCase() === targetProduct.name.toLowerCase()
        );
      }
    }

    if (!item) {
      res.status(404).json({ success: false, message: 'Product not found in this order' });
      return;
    }

    // 5. Get the driveLink (from order item snapshot or product catalogue)
    let driveLink = item.driveLink;
    if (!driveLink) {
      let prod: any = null;
      if (/^[0-9a-fA-F]{24}$/.test(item.productId)) {
        prod = await Product.findById(item.productId).select('driveLink');
      }
      if (!prod) {
        prod = await Product.findOne({ slug: item.productId }).select('driveLink');
      }
      if (!prod && item.title) {
        prod = await Product.findOne({ name: item.title }).select('driveLink');
      }
      if (prod?.driveLink) {
        driveLink = prod.driveLink;
        // Also persist driveLink to item for future instant requests
        item.driveLink = driveLink || '';
        await order.save().catch(() => {});
      }
    }

    if (!driveLink) {
      res.status(404).json({
        success: false,
        message: `Digital download file is not configured for "${item.title}". Please contact support at civildigitalstore25@gmail.com.`,
      });
      return;
    }

    const fileId = googleDriveService.extractFileId(driveLink);
    if (!fileId) {
      res.status(400).json({
        success: false,
        message: 'Invalid Google Drive link configuration on product.',
      });
      return;
    }

    // Check Google Drive configuration
    if (!googleDriveService.isConfigured()) {
      res.status(503).json({
        success: false,
        message: 'Google Drive service is currently unavailable or credentials are not configured.',
      });
      return;
    }

    // Fetch file metadata to verify accessibility and get real file name
    const metadata = await googleDriveService.getFileMetadata(fileId);

    // Create a secure expiring download token (valid for 15 minutes)
    const token = jwt.sign(
      {
        orderId: order.orderId,
        productId: item.productId,
        fileId,
        fileName: metadata.name,
      } as DownloadJwtPayload,
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    const downloadUrl = `/api/downloads/file?token=${encodeURIComponent(token)}`;

    res.json({
      success: true,
      downloadUrl,
      fileName: metadata.name,
      fileSize: metadata.size,
      mimeType: metadata.mimeType,
    });
  } catch (error: any) {
    console.error('Error generating download token:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to prepare download',
      error,
    });
  }
};

export const streamDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'Valid download token is required' });
      return;
    }

    let payload: DownloadJwtPayload;
    try {
      payload = jwt.verify(token, config.jwtSecret) as DownloadJwtPayload;
    } catch {
      res.status(401).json({ success: false, message: 'Download link has expired or is invalid. Please request a new one.' });
      return;
    }

    const { fileId, fileName: tokenFileName, orderId, productId } = payload;
    if (!fileId) {
      res.status(400).json({ success: false, message: 'Invalid download payload' });
      return;
    }

    const streamResult = await googleDriveService.getFileStream(fileId);
    const finalName = streamResult.metadata.name || tokenFileName || 'downloaded-file';
    const safeFilename = finalName.replace(/["\r\n]/g, '_');

    res.setHeader('Content-Type', streamResult.metadata.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
    );
    if (streamResult.metadata.size) {
      res.setHeader('Content-Length', streamResult.metadata.size);
    }
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    streamResult.stream.pipe(res);

    streamResult.stream.on('error', (streamErr) => {
      console.error('Error while streaming from Google Drive:', streamErr);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file from storage' });
      }
    });

    res.on('finish', async () => {
      // Increment downloads count in the background
      try {
        if (productId && /^[0-9a-fA-F]{24}$/.test(productId)) {
          await Product.findByIdAndUpdate(productId, { $inc: { downloadsCount: 1 } });
        }
        if (orderId) {
          await Order.findOneAndUpdate({ orderId }, { $inc: { downloadCount: 1 } });
        }
      } catch (countErr) {
        console.error('Failed to update download counters:', countErr);
      }
    });
  } catch (error: any) {
    console.error('Error in streamDownload:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to download file',
        error,
      });
    }
  }
};

export const listAdminDriveFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!googleDriveService.isConfigured()) {
      res.status(503).json({ success: false, message: 'Google Drive is not configured' });
      return;
    }

    const folderId = (req.query.folderId as string) || undefined;
    const files = await googleDriveService.listFilesInFolder(folderId);

    res.json({
      success: true,
      folderId: folderId || config.googleDriveFolderId,
      files,
    });
  } catch (error: any) {
    console.error('Error listing drive files:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list drive files',
    });
  }
};
