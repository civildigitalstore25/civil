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
    const { orderId, productId, customerEmail, orderData } = req.body;

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

    // 2. If not found in DB, auto-recover/persist from client orderData (e.g. from local storage)
    if (!order && orderData && typeof orderData === 'object') {
      try {
        const enrichedItems = await Promise.all(
          (orderData.items || []).map(async (it: any) => {
            let driveLink = it.driveLink || '';
            let targetId = String(it.productId || it.id || '');

            if (!driveLink && targetId) {
              let prod: any = null;
              if (/^[0-9a-fA-F]{24}$/.test(targetId)) {
                prod = await Product.findById(targetId).select('driveLink');
              }
              if (!prod) {
                prod = await Product.findOne({ slug: targetId }).select('driveLink');
              }
              if (!prod && it.title) {
                prod = await Product.findOne({ name: it.title }).select('driveLink');
              }
              if (prod?.driveLink) {
                driveLink = prod.driveLink;
              }
              if (prod?._id) {
                targetId = prod._id.toString();
              }
            }

            return {
              productId: targetId,
              title: String(it.title || it.name || 'Digital Product'),
              price: Number(it.price) || 0,
              quantity: Number(it.quantity) || 1,
              image: it.image || '',
              fileFormat: it.fileFormat || 'ZIP Download',
              driveLink,
            };
          })
        );

        order = await Order.create({
          orderId: cleanId,
          userId: req.user?._id?.toString() || orderData.userId || 'guest_user',
          customerName: orderData.customerName || 'Customer',
          customerEmail: (orderData.customerEmail || customerEmail || '').toLowerCase(),
          customerPhone: orderData.customerPhone || '',
          shippingAddress: orderData.shippingAddress || '',
          items: enrichedItems,
          subtotal: Number(orderData.subtotal) || 0,
          gst: Number(orderData.gst) || 0,
          totalAmount: Number(orderData.totalAmount) || 0,
          status: 'Completed',
          paymentMethod: orderData.paymentMethod || 'UPI / QR Code',
          paymentStatus: 'Paid',
        });
      } catch (recoveryErr) {
        console.warn('Auto-recovery of order into DB produced warning:', recoveryErr);
      }
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

    // If order was created without a logged-in account, allow token generation by order reference & customer
    if (!isAdmin && !isOwner && !isGuestMatch && order.userId !== 'guest_user') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to download files for this order',
      });
      return;
    }

    // Check payment / order status
    if (order.status !== 'Completed' && order.paymentStatus !== 'Paid' && !isAdmin) {
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
        message: `Digital download file is not configured for "${item.title}". Please contact support at softzcart@gmail.com.`,
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
