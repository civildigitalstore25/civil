import { STORAGE_KEYS, storageService } from '../services/storageService';
import { CATEGORY_DEFINITIONS } from '../data/categories';

export const initializeAppData = (): void => {
  storageService.removeItem(STORAGE_KEYS.LEGACY_AUTH_TOKEN);

  // Remove all mock seed products, reviews, and sample orders so only backend data is used
  storageService.removeItem(STORAGE_KEYS.PRODUCTS);
  storageService.removeItem(STORAGE_KEYS.REVIEWS);
  storageService.removeItem(STORAGE_KEYS.ORDERS);

  // Initialize category definitions if not present
  const existingCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!existingCategories) {
    storageService.setItem(STORAGE_KEYS.CATEGORIES, CATEGORY_DEFINITIONS);
  }
};
