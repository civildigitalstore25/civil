import type { Response } from 'express';
import { type AuthRequest } from '../middlewares/authMiddleware.js';
import Cart, { type ICartItem } from '../models/Cart.js';
import Product from '../models/Product.js';

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

const extractLicenseLabel = (name: string, productId: string, explicit?: unknown): string => {
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim();
  }
  const parenMatch = /\(([^()]+)\)\s*$/.exec(name.trim());
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }
  const planPart = productId.includes('::') ? productId.split('::')[1]?.trim() : '';
  if (!planPart) return 'Standard';
  if (planPart === 'lifetime') return 'Lifetime';
  if (planPart === 'membership') return 'Membership';
  if (planPart === 'ebook') return 'eBook';
  return planPart;
};

const stripLicenseSuffix = (name: string, license: string): string => {
  const trimmed = name.trim();
  if (!license) return trimmed;
  const suffix = `(${license})`;
  if (trimmed.endsWith(suffix)) {
    return trimmed.slice(0, -suffix.length).trim();
  }
  return trimmed;
};

interface ProductLookupRow {
  _id: { toString(): string };
  slug?: string;
  brand?: string;
  company?: string;
  software?: string;
  category?: string;
  images?: string[];
  imageUrl?: string;
}

const buildProductLookup = async (baseIds: string[]): Promise<Map<string, ProductLookupRow>> => {
  const uniqueIds = Array.from(new Set(baseIds.filter(Boolean)));
  const map = new Map<string, ProductLookupRow>();
  if (uniqueIds.length === 0) return map;

  const objectIds = uniqueIds.filter((id) => OBJECT_ID_RE.test(id));
  const slugs = uniqueIds.filter((id) => !OBJECT_ID_RE.test(id));
  const orConditions: Record<string, unknown>[] = [];
  if (objectIds.length > 0) orConditions.push({ _id: { $in: objectIds } });
  if (slugs.length > 0) orConditions.push({ slug: { $in: slugs } });
  if (orConditions.length === 0) return map;

  const products = (await Product.find({ $or: orConditions })
    .select('slug brand company software category images imageUrl')
    .lean()) as unknown as ProductLookupRow[];

  for (const prod of products) {
    map.set(prod._id.toString(), prod);
    if (prod.slug) {
      map.set(prod.slug.toLowerCase(), prod);
    }
  }
  return map;
};

const resolveProductMeta = (
  baseProductId: string,
  lookup: Map<string, ProductLookupRow>
): ProductLookupRow | undefined => {
  if (!baseProductId) return undefined;
  return lookup.get(baseProductId) ?? lookup.get(baseProductId.toLowerCase());
};

const normalizeCartItems = async (rawItems: unknown): Promise<ICartItem[]> => {
  if (!Array.isArray(rawItems)) return [];

  const preliminary = rawItems
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'))
    .map((item) => {
      const productId = String(item.productId || item.id || '').trim();
      const id = String(item.id || productId).trim();
      const baseProductId = productId.split('::')[0]?.trim() || '';
      const name = String(item.name || '').trim();
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const price = Math.max(0, Number(item.price) || 0);
      const oldPrice = Math.max(0, Number(item.oldPrice) || 0);

      return {
        id,
        productId,
        baseProductId,
        name,
        brand: typeof item.brand === 'string' ? item.brand.trim() : '',
        category: typeof item.category === 'string' ? item.category.trim() : '',
        license: extractLicenseLabel(name, productId, item.license),
        image: typeof item.image === 'string' ? item.image.trim() : '',
        format: typeof item.format === 'string' ? item.format.trim() : '',
        fileSize: typeof item.fileSize === 'string' ? item.fileSize.trim() : '',
        price,
        oldPrice,
        quantity,
        instantDownload: item.instantDownload !== false,
      };
    })
    .filter((item) => item.id && item.productId && item.name);

  const lookup = await buildProductLookup(preliminary.map((item) => item.baseProductId));

  return preliminary.map((item) => {
    const prod = resolveProductMeta(item.baseProductId, lookup);
    return {
      ...item,
      brand: item.brand || prod?.brand || prod?.company || prod?.software || '',
      category: item.category || prod?.category || '',
      image: item.image || prod?.images?.[0] || prod?.imageUrl || '',
    };
  });
};

export const getMyCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id }).lean();
    res.json({
      success: true,
      items: cart?.items || [],
      updatedAt: cart?.updatedAt || null,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load cart' });
  }
};

export const syncMyCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const items = await normalizeCartItems((req.body as { items?: unknown })?.items);

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      success: true,
      items: cart?.items || [],
      updatedAt: cart?.updatedAt || null,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to sync cart' });
  }
};

export const clearMyCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to clear cart' });
  }
};

interface PopulatedUser {
  _id: { toString(): string };
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export const getAdminCarts = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawCarts = await Cart.find({ 'items.0': { $exists: true } })
      .populate('user', 'name email phone role')
      .sort({ updatedAt: -1 })
      .lean();

    const baseIds: string[] = [];
    for (const cart of rawCarts) {
      for (const item of cart.items || []) {
        const baseId = item.baseProductId || String(item.productId || item.id || '').split('::')[0] || '';
        if (baseId) baseIds.push(baseId);
      }
    }
    const productLookup = await buildProductLookup(baseIds);

    const carts = rawCarts
      .filter((cart) => Boolean(cart.user && typeof cart.user === 'object'))
      .map((cart) => {
        const user = cart.user as unknown as PopulatedUser;
        const items = (cart.items || []).map((item) => {
          const baseId = item.baseProductId || String(item.productId || item.id || '').split('::')[0] || '';
          const prod = resolveProductMeta(baseId, productLookup);
          const license = extractLicenseLabel(item.name, item.productId, item.license);
          const price = Number(item.price) || 0;
          const quantity = Math.max(1, Number(item.quantity) || 1);

          return {
            id: item.id,
            productId: item.productId,
            baseProductId: baseId,
            name: stripLicenseSuffix(item.name, license),
            displayName: item.name,
            brand: item.brand || prod?.brand || prod?.company || prod?.software || '-',
            category: item.category || prod?.category || '-',
            license: license || '-',
            image: item.image || prod?.images?.[0] || prod?.imageUrl || '',
            format: item.format || '',
            fileSize: item.fileSize || '',
            price,
            oldPrice: Number(item.oldPrice) || 0,
            quantity,
            lineTotal: price * quantity,
          };
        });

        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

        return {
          id: cart._id.toString(),
          user: {
            id: user._id.toString(),
            name: user.name || 'Customer',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'user',
          },
          items,
          totalItems,
          totalAmount,
          updatedAt: cart.updatedAt,
          createdAt: cart.createdAt,
        };
      });

    res.json({ success: true, carts });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to retrieve user carts' });
  }
};
