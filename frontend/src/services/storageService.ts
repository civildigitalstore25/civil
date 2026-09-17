export const STORAGE_KEYS = {
  USERS: 'civil_users',
  CURRENT_USER: 'civil_current_user',
  PRODUCTS: 'civil_products',
  CATEGORIES: 'civil_categories',
  ORDERS: 'civil_orders',
  CART: 'civil_cart',
  WISHLIST: 'civil_wishlist',
  REVIEWS: 'civil_reviews',
  LEGACY_AUTH_TOKEN: 'civil_auth_token',
} as const;

export const storageService = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading key "${key}" from localStorage:`, error);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting key "${key}" in localStorage:`, error);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing key "${key}" from localStorage:`, error);
    }
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
