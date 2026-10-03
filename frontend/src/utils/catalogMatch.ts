import type { Product } from '../types/product';
import { slugify } from './slugify';

export const productMatchesCatalog = (
  product: Product,
  category: { name: string; slug: string },
  brand?: { name: string; slug: string },
): boolean => {
  if (product.status === 'inactive' || product.status === 'draft') return false;

  const categorySlug = (product.categorySlug || slugify(product.category || '')).toLowerCase();
  const categoryName = (product.category || '').trim().toLowerCase();
  const matchesCategory =
    categorySlug === category.slug.toLowerCase() || categoryName === category.name.trim().toLowerCase();
  if (!matchesCategory) return false;
  if (!brand) return true;

  const brandName = (product.brand || product.software || product.company || '').trim().toLowerCase();
  return brandName === brand.name.trim().toLowerCase() || slugify(brandName) === brand.slug.toLowerCase();
};
