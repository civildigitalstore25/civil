import { STORAGE_KEYS, storageService } from './storageService';
import type { CartItem } from '../types/cart';

export const cartService = {
  getCart(): CartItem[] {
    return storageService.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  saveCart(cartItems: CartItem[]): void {
    storageService.setItem<CartItem[]>(STORAGE_KEYS.CART, cartItems);
  },

  clearCart(): void {
    storageService.removeItem(STORAGE_KEYS.CART);
  }
};
