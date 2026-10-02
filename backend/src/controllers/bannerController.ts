import type { Request, Response } from 'express';
import Banner from '../models/Banner.js';

const present = (banner: {
  _id: unknown;
  slot: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
}) => ({
  id: String(banner._id),
  slot: banner.slot,
  imageUrl: banner.imageUrl,
  linkUrl: banner.linkUrl,
  isActive: banner.isActive,
  sortOrder: banner.sortOrder,
});

const readSlot = (value: unknown): 'left' | 'right' | null => {
  const slot = String(value || '').trim();
  return slot === 'left' || slot === 'right' ? slot : null;
};

export const getActiveBanners = async (_req: Request, res: Response): Promise<void> => {
  const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  res.json({ success: true, banners: banners.map(present) });
};

export const getAllBanners = async (_req: Request, res: Response): Promise<void> => {
  const banners = await Banner.find().sort({ slot: 1, sortOrder: 1, createdAt: 1 });
  res.json({ success: true, banners: banners.map(present) });
};

export const createBanner = async (req: Request, res: Response): Promise<void> => {
  const slot = readSlot(req.body.slot);
  const imageUrl = String(req.body.imageUrl || '').trim();
  const linkUrl = String(req.body.linkUrl || '').trim();
  if (!slot) {
    res.status(400).json({ success: false, message: 'Choose the left or right banner.' });
    return;
  }
  if (!imageUrl) {
    res.status(400).json({ success: false, message: 'Image URL is required.' });
    return;
  }
  const count = await Banner.countDocuments({ slot });
  const banner = await Banner.create({
    slot,
    imageUrl,
    linkUrl,
    isActive: req.body.isActive !== false,
    sortOrder: count,
  });
  res.status(201).json({ success: true, banner: present(banner) });
};

export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404).json({ success: false, message: 'Banner not found' });
    return;
  }
  if (req.body.slot !== undefined) {
    const slot = readSlot(req.body.slot);
    if (!slot) {
      res.status(400).json({ success: false, message: 'Choose the left or right banner.' });
      return;
    }
    banner.slot = slot;
  }
  if (req.body.imageUrl !== undefined) {
    const imageUrl = String(req.body.imageUrl).trim();
    if (!imageUrl) {
      res.status(400).json({ success: false, message: 'Image URL is required.' });
      return;
    }
    banner.imageUrl = imageUrl;
  }
  if (req.body.linkUrl !== undefined) banner.linkUrl = String(req.body.linkUrl).trim();
  if (req.body.isActive !== undefined) banner.isActive = Boolean(req.body.isActive);
  await banner.save();
  res.json({ success: true, banner: present(banner) });
};

export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    res.status(404).json({ success: false, message: 'Banner not found' });
    return;
  }
  res.json({ success: true });
};
