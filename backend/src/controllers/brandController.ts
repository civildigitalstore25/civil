import type { Request, Response } from 'express';
import Brand from '../models/Brand.js';
import { DEFAULT_BRANDS } from '../constants/defaultBrands.js';

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureDefaults = async (): Promise<void> => {
  const count = await Brand.countDocuments();
  if (count > 0) return;
  await Brand.insertMany(
    DEFAULT_BRANDS.map((brand) => ({
      name: brand.name,
      slug: toSlug(brand.name),
      categories: brand.categories.map((name) => ({ name, slug: toSlug(name) })),
    })),
  );
};

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  await ensureDefaults();
  const brands = await Brand.find().sort({ name: 1 });
  res.json({ success: true, brands });
};

export const createBrand = async (req: Request, res: Response): Promise<void> => {
  const name = String(req.body.name || '').trim();
  if (!name) {
    res.status(400).json({ success: false, message: 'Brand name is required' });
    return;
  }
  const slug = toSlug(String(req.body.slug || '').trim() || name);
  if (!slug) {
    res.status(400).json({ success: false, message: 'Brand slug is required' });
    return;
  }
  const existing = await Brand.findOne({ slug });
  if (existing) {
    res.status(400).json({ success: false, message: 'That brand slug already exists' });
    return;
  }
  const brand = await Brand.create({ name, slug, categories: [] });
  res.status(201).json({ success: true, brand });
};

export const addBrandCategory = async (req: Request, res: Response): Promise<void> => {
  const name = String(req.body.name || '').trim();
  if (!name) {
    res.status(400).json({ success: false, message: 'Category name is required' });
    return;
  }
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404).json({ success: false, message: 'Brand not found' });
    return;
  }
  const slug = toSlug(String(req.body.slug || '').trim() || name);
  if (!slug) {
    res.status(400).json({ success: false, message: 'Category slug is required' });
    return;
  }
  if (brand.categories.some((item) => item.slug === slug)) {
    res.status(400).json({ success: false, message: 'That category slug already exists in this brand' });
    return;
  }
  brand.categories.push({ name, slug });
  await brand.save();
  res.status(201).json({ success: true, brand });
};

export const deleteBrandCategory = async (req: Request, res: Response): Promise<void> => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404).json({ success: false, message: 'Brand not found' });
    return;
  }
  brand.categories = brand.categories.filter((item) => item.slug !== req.params.slug);
  await brand.save();
  res.json({ success: true, brand });
};

export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    res.status(404).json({ success: false, message: 'Brand not found' });
    return;
  }
  res.json({ success: true });
};
