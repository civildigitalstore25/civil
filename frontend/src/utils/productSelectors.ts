import type { Product } from '../types/product';
import type { CategoryDefinition } from '../data/categories';

/**
 * Filter and sort Best Seller products.
 * Criteria: product.isBestSeller === true AND product.status !== 'inactive'
 * Sorting: Highest rating then highest review count
 */
export const getBestSellerProducts = (products: Product[]): Product[] => {
  return products
    .filter((p) => (p.isBestSeller === true || p.badge === 'Bestseller') && p.status !== 'inactive')
    .sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    });
};

/**
 * Filter and sort Newly Arrived products.
 * Criteria: product.isNewArrival === true AND product.status !== 'inactive'
 * Sorting: createdAt DESC (newest first)
 */
export const getNewArrivalProducts = (products: Product[]): Product[] => {
  return products
    .filter((p) => (p.isNewArrival === true || p.badge === 'New') && p.status !== 'inactive')
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
};

/**
 * Filter and sort category products.
 * Matches category by slug, category name, or software.
 * Sort priority: Best Sellers first, then higher rating, then newest.
 */
export const getCategoryProducts = (
  products: Product[],
  category: CategoryDefinition,
  limit: number = 4
): Product[] => {
  const activeProducts = products.filter((p) => p.status !== 'inactive');

  const filtered = activeProducts.filter((p) => {
    // Match by slug or category/software matching filterValue
    if (p.categorySlug && p.categorySlug.toLowerCase() === category.slug.toLowerCase()) {
      return true;
    }
    if (category.filterType === 'software') {
      return (
        p.software?.toLowerCase() === (category.filterValue as string).toLowerCase() ||
        p.category?.toLowerCase() === (category.filterValue as string).toLowerCase()
      );
    }
    if (category.filterType === 'category') {
      return p.category?.toLowerCase() === (category.filterValue as string).toLowerCase();
    }
    return false;
  });

  return filtered
    .sort((a, b) => {
      // 1. Best seller first
      const bestA = a.isBestSeller ? 1 : 0;
      const bestB = b.isBestSeller ? 1 : 0;
      if (bestB !== bestA) return bestB - bestA;

      // 2. Higher rating
      if (b.rating !== a.rating) return b.rating - a.rating;

      // 3. Newer created date
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
};

/**
 * Get active product count for a given category
 */
export const getCategoryProductCount = (
  products: Product[],
  category: CategoryDefinition
): number => {
  const activeProducts = products.filter((p) => p.status !== 'inactive');

  return activeProducts.filter((p) => {
    if (p.categorySlug && p.categorySlug.toLowerCase() === category.slug.toLowerCase()) {
      return true;
    }
    if (category.filterType === 'software') {
      return (
        p.software?.toLowerCase() === (category.filterValue as string).toLowerCase() ||
        p.category?.toLowerCase() === (category.filterValue as string).toLowerCase()
      );
    }
    if (category.filterType === 'category') {
      return p.category?.toLowerCase() === (category.filterValue as string).toLowerCase();
    }
    return false;
  }).length;
};
