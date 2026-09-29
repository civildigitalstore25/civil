import type { Request, Response } from 'express';
import Product from '../models/Product.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      software,
      status,
      isBestSeller,
      isOutOfStock,
      page = 1,
      limit = 100
    } = req.query;

    const filter: Record<string, any> = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { software: searchRegex },
        { category: searchRegex },
        { seoKeywords: searchRegex }
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (software && software !== 'All') {
      filter.software = software;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (isBestSeller === 'true') {
      filter.isBestSeller = true;
    }

    if (isOutOfStock === 'true') {
      filter.isOutOfStock = true;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit) || 200);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const product = await Product.findOne({ slug });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    if (!data.name && data.status !== 'draft') {
      res.status(400).json({ success: false, message: 'Product name is required' });
      return;
    }

    // Slug calculation & normalization
    let slug = (data.slug || data.name || 'product')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const duplicate = await Product.findOne({ slug });
    if (duplicate) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    data.slug = slug;
    data.software = data.software || data.brand || '';
    data.brand = data.brand || data.software || '';
    data.categorySlug = data.category
      ? String(data.categorySlug || data.category)
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
      : '';
    if (!Array.isArray(data.images) || data.images.length === 0) {
      data.images = [data.imageUrl, ...(data.additionalImages || [])].filter(Boolean);
    }
    data.shortDescription = data.shortDescription || '';
    const price = Number(data.price) || 0;
    const oldPrice = Number(data.oldPrice) || 0;
    data.price = price;
    data.oldPrice = oldPrice;
    data.discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create product', error });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (data.slug) {
      const normalizedSlug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const duplicate = await Product.findOne({ slug: normalizedSlug, _id: { $ne: id as any } } as any);
      if (duplicate) {
        res.status(400).json({ success: false, message: `Slug "${normalizedSlug}" is already taken.` });
        return;
      }
      data.slug = normalizedSlug;
    }

    if (data.price !== undefined || data.oldPrice !== undefined) {
      const existing = await Product.findById(id);
      const price = data.price !== undefined ? Number(data.price) || 0 : (existing?.price || 0);
      const oldPrice = data.oldPrice !== undefined ? Number(data.oldPrice) || 0 : (existing?.oldPrice || 0);
      data.discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error });
  }
};

export const bulkDeleteProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'No product IDs provided' });
      return;
    }

    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} products deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed bulk delete', error });
  }
};

export const toggleBestSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    product.isBestSeller = !product.isBestSeller;
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle best seller', error });
  }
};

export const toggleOutOfStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    product.isOutOfStock = !product.isOutOfStock;
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle out of stock', error });
  }
};
