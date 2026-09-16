import { STORAGE_KEYS, storageService } from './storageService';
import type { Order, OrderStatus } from '../types/order';
import { generateId } from '../utils/generateId';

export const orderService = {
  getOrders(): Order[] {
    return storageService.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  },

  saveOrders(orders: Order[]): void {
    storageService.setItem<Order[]>(STORAGE_KEYS.ORDERS, orders);
  },

  getUserOrders(userId?: string, userEmail?: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(
      (o) =>
        (userId && o.userId === userId) ||
        (userEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase())
    );
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  },

  createOrder(data: Omit<Order, 'id' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...data,
      id: generateId('ord'),
      createdAt: new Date().toISOString()
    };

    const updated = [newOrder, ...orders];
    this.saveOrders(updated);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus): { success: boolean; order?: Order; error?: string } {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      return { success: false, error: 'Order not found.' };
    }

    const updatedOrder = { ...orders[index], status };
    orders[index] = updatedOrder;
    this.saveOrders(orders);

    return { success: true, order: updatedOrder };
  }
};
