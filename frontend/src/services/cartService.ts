import { STORAGE_KEYS, storageService } from './storageService';
import { apiRequest } from './apiClient';
import type { AdminCartRecord, CartItem } from '../types/cart';

export const cartService = {
  getCart(): CartItem[] {
    return storageService.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  saveCart(cartItems: CartItem[]): void {
    storageService.setItem<CartItem[]>(STORAGE_KEYS.CART, cartItems);
  },

  clearCart(): void {
    storageService.removeItem(STORAGE_KEYS.CART);
  },

  async fetchMyCart(): Promise<CartItem[] | null> {
    try {
      const { response, data } = await apiRequest<{
        success: boolean;
        items?: CartItem[];
      }>('/cart');
      if (!response.ok || !data.success) return null;
      return Array.isArray(data.items) ? data.items : [];
    } catch {
      return null;
    }
  },

  async syncMyCart(items: CartItem[]): Promise<void> {
    try {
      await apiRequest<{ success: boolean }>('/cart', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
    } catch {
      // Keep localStorage cart intact even if offline
    }
  },

  async clearServerCart(): Promise<void> {
    try {
      await apiRequest<{ success: boolean }>('/cart', {
        method: 'DELETE',
      });
    } catch {
      // Ignore network error on clear
    }
  },

  async fetchAdminCarts(): Promise<AdminCartRecord[]> {
    const { response, data } = await apiRequest<{
      success: boolean;
      carts?: AdminCartRecord[];
      message?: string;
    }>('/cart/admin');
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load user carts');
    }
    return Array.isArray(data.carts) ? data.carts : [];
  },
};
