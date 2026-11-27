import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Product, { type IProduct } from '../models/Product.js';
import User from '../models/User.js';
import { AUTH } from '../constants/auth.js';
import { config } from '../config/index.js';
import { isDealActive, isFreeOfferActive } from '../utils/productSchedule.js';

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const positiveAmount = (value: unknown): number => {
  const num = typeof value === 'number' ? value : Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(num) && num > 0 ? num : 0;
};

const buildSearchCondition = (rawSearch: string): Record<string, any> | null => {
  const tokens = rawSearch
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  if (tokens.length === 0) return null;

  const tokenConditions = tokens.map((token) => {
    const regex = new RegExp(escapeRegex(token), 'i');
    return {
      $or: [
        { name: regex },
        { slug: regex },
        { brand: regex },
        { company: regex },
        { software: regex },
        { category: regex },
        { seoKeywords: regex },
      ],
    };
  });

  return tokenConditions.length === 1 ? (tokenConditions[0] ?? null) : { $and: tokenConditions };
};

const buildCategoryScopeCondition = (rawCategory: string): Record<string, any> | null => {
  const trimmed = rawCategory.trim();
  if (!trimmed || trimmed === 'All' || trimmed === 'All Categories') return null;
  const regex = new RegExp(escapeRegex(trimmed), 'i');
  return {
    $or: [
      { category: regex },
      { software: regex },
      { brand: regex },
      { company: regex },
    ],
  };
};

const computeEffectivePriceINR = (p: any): { price: number; isFree: boolean } => {
  if (isFreeOfferActive(p)) {
    return { price: 0, isFree: true };
  }

  const dealOn = isDealActive(p);
  const candidates: number[] = [];

  const pushIfPositive = (val: unknown) => {
    const amt = positiveAmount(val);
    if (amt > 0) candidates.push(amt);
  };

  pushIfPositive(dealOn ? positiveAmount(p.dealEbookPriceINR) || p.ebookPriceINR : p.ebookPriceINR);
  pushIfPositive(
    dealOn
      ? positiveAmount(p.dealLifetimePriceINR) || p.lifetimePriceINR || p.lifetimePrice
      : p.lifetimePriceINR || p.lifetimePrice
  );
  pushIfPositive(
    dealOn
      ? positiveAmount(p.dealMembershipPriceINR) || p.membershipPriceINR || p.membershipPrice
      : p.membershipPriceINR || p.membershipPrice
  );

  const subRows = Array.isArray(p.subscriptionDurations) && p.subscriptionDurations.length
    ? p.subscriptionDurations
    : Array.isArray(p.subscriptions)
      ? p.subscriptions
      : [];
  const dealSubRows = Array.isArray(p.dealSubscriptionDurations) && p.dealSubscriptionDurations.length
    ? p.dealSubscriptionDurations
    : Array.isArray(p.dealSubscriptions)
      ? p.dealSubscriptions
      : [];

  subRows.forEach((row: any, idx: number) => {
    const regular = positiveAmount(row?.priceINR || row?.price);
    const dealRow = dealSubRows[idx];
    const deal = dealOn ? positiveAmount(dealRow?.priceINR || dealRow?.price) : 0;
    pushIfPositive(deal || regular);
  });

  if (candidates.length > 0) {
    return { price: Math.min(...candidates), isFree: false };
  }

  return { price: positiveAmount(p.price), isFree: false };
};

const scoreSuggestion = (p: any, queryLower: string, tokens: string[]): number => {
  const name = String(p.name || '').toLowerCase();
  const brand = String(p.brand || p.company || p.software || '').toLowerCase();
  const category = String(p.category || '').toLowerCase();

  let score = 0;
  if (name === queryLower) score += 200;
  else if (name.startsWith(queryLower)) score += 120;
  else if (name.split(/\s+/).some((word) => word.startsWith(queryLower))) score += 80;
  else if (name.includes(queryLower)) score += 50;

  for (const token of tokens) {
    if (name.startsWith(token)) score += 25;
    else if (name.includes(token)) score += 15;
    if (brand.includes(token) || category.includes(token)) score += 10;
  }

  if (p.isBestSeller) score += 5;
  return score;
};

export const getProductSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawQuery = String(req.query.q ?? req.query.search ?? '').trim();
    const rawCategory = String(req.query.category ?? '').trim();
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

    if (!rawQuery) {
      res.json({ success: true, suggestions: [] });
      return;
    }

    const andFilters: Record<string, any>[] = [{ status: 'active' }];
    const searchCond = buildSearchCondition(rawQuery);
    if (searchCond) andFilters.push(searchCond);

    const categoryCond = buildCategoryScopeCondition(rawCategory);
    if (categoryCond) andFilters.push(categoryCond);

    const filter = andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

    const candidates = await Product.find(filter)
      .select(
        'name slug images imageUrl price oldPrice brand company software category isBestSeller downloadsCount isFreeProduct freeProductStartDate freeProductStartTime freeProductEndDate freeProductEndTime isDeal dealStartDate dealStartTime dealEndDate dealEndTime ebookPriceINR lifetimePrice lifetimePriceINR membershipPrice membershipPriceINR subscriptionDurations subscriptions dealEbookPriceINR dealLifetimePriceINR dealMembershipPriceINR dealSubscriptionDurations dealSubscriptions'
      )
      .limit(limit * 4)
      .lean();

    const queryLower = rawQuery.toLowerCase();
    const tokens = queryLower.split(/\s+/).filter(Boolean).slice(0, 5);

    const ranked = candidates
      .map((prod) => ({
        prod,
        score: scoreSuggestion(prod, queryLower, tokens),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const dlDiff = (Number(b.prod.downloadsCount) || 0) - (Number(a.prod.downloadsCount) || 0);
        if (dlDiff !== 0) return dlDiff;
        return String(a.prod.name || '').localeCompare(String(b.prod.name || ''));
      })
      .slice(0, limit)
      .map(({ prod }) => {
        const { price, isFree } = computeEffectivePriceINR(prod);
        const image =
          (Array.isArray(prod.images) && prod.images[0]) ||
          (typeof prod.imageUrl === 'string' ? prod.imageUrl : '') ||
          '';
        return {
          id: prod._id.toString(),
          name: prod.name,
          slug: prod.slug,
          image,
          brand: prod.brand || prod.company || prod.software || '',
          category: prod.category || '',
          software: prod.software || '',
          price,
          isFree,
        };
      });

    res.setHeader('Cache-Control', 'public, max-age=30');
    res.json({ success: true, suggestions: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch suggestions', error });
  }
};

const checkIsAdmin = async (req: Request): Promise<boolean> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    const token = req.cookies?.[AUTH.cookieName] ?? bearerToken;
    if (!token) return false;

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (decoded?.role === 'admin' || decoded?.role === 'superadmin') {
      const user = await User.findById(decoded.id);
      return user?.role === 'admin' || user?.role === 'superadmin';
    }
    return false;
  } catch {
    return false;
  }
};

const sanitizeProduct = (product: any, isAdmin: boolean) => {
  if (!product) return null;
  const obj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  if (!isAdmin) {
    delete obj.driveLink;
  }
  return obj;
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      software,
      brand,
      status,
      isBestSeller,
      isOutOfStock,
      sort,
      page = 1,
      limit = 100
    } = req.query;

    const andFilters: Record<string, any>[] = [];

    if (search && String(search).trim()) {
      const searchCond = buildSearchCondition(String(search));
      if (searchCond) andFilters.push(searchCond);
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      const catCond = buildCategoryScopeCondition(String(category));
      if (catCond) andFilters.push(catCond);
    }

    if (software && software !== 'All') {
      andFilters.push({ software: new RegExp(`^${escapeRegex(String(software).trim())}$`, 'i') });
    }

    if (brand && brand !== 'All') {
      const brandRegex = new RegExp(`^${escapeRegex(String(brand).trim())}$`, 'i');
      andFilters.push({ $or: [{ brand: brandRegex }, { company: brandRegex }, { software: brandRegex }] });
    }

    if (status && status !== 'all') {
      andFilters.push({ status });
    }

    if (isBestSeller === 'true') {
      andFilters.push({ isBestSeller: true });
    }

    if (isOutOfStock === 'true') {
      andFilters.push({ isOutOfStock: true });
    }

    const filter =
      andFilters.length === 0
        ? {}
        : andFilters.length === 1
          ? andFilters[0]
          : { $and: andFilters };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      'price-low': { price: 1, createdAt: -1 },
      'price-high': { price: -1, createdAt: -1 },
      rating: { rating: -1, reviewCount: -1 },
      newest: { createdAt: -1 },
    };
    const sortQuery = sortMap[String(sort || '')] || { createdAt: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(500, Math.max(1, Number(limit) || 100));
    const skip = (pageNum - 1) * limitNum;

    const [isAdmin, total, products] = await Promise.all([
      checkIsAdmin(req),
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const sanitizedProducts = products.map((p) => sanitizeProduct(p, isAdmin));

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      products: sanitizedProducts,
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
    const isAdmin = await checkIsAdmin(req);
    res.json({ success: true, product: sanitizeProduct(product, isAdmin) });
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
    const isAdmin = await checkIsAdmin(req);
    res.json({ success: true, product: sanitizeProduct(product, isAdmin) });
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
    // Rating & review count are derived from approved reviews (see reviewController.syncProductRating).
    // Ignore any stale values sent back by the admin product form.
    if (data && typeof data === 'object') {
      delete data.rating;
      delete data.reviewCount;
    }

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

/** POST /api/products/:id/increment-view — bump total PDP views. */
export const incrementProductViewCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true, select: 'viewCount' },
    );
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, viewCount: product.viewCount || 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to increment view count', error });
  }
};

/** GET /api/products/:id/view-count — read views without incrementing. */
export const getProductViewCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).select('viewCount');
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, viewCount: product.viewCount || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get view count', error });
  }
};
