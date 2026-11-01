import { STORAGE_KEYS, storageService } from './storageService';
import type { Order, OrderStatus } from '../types/order';
import { generateId } from '../utils/generateId';
import { apiRequest } from './apiClient';

interface BackendOrderResponse {
  success: boolean;
  order?: any;
  orders?: any[];
  message?: string;
}

const mapBackendOrder = (raw: any): Order => ({
  id: raw.orderId || raw.id || raw._id,
  orderId: raw.orderId || raw.id || raw._id,
  userId: raw.userId || 'guest_user',
  customerName: raw.customerName || '',
  customerEmail: raw.customerEmail || '',
  customerPhone: raw.customerPhone || '',
  shippingAddress: raw.shippingAddress || '',
  items: (raw.items || []).map((it: any) => ({
    id: it.id || it._id || it.productId,
    productId: it.productId || it.id,
    title: it.title || it.name || '',
    price: Number(it.price) || 0,
    quantity: Number(it.quantity) || 1,
    image: it.image || '',
    fileFormat: it.fileFormat || 'ZIP Download',
    hasDownload: Boolean(it.hasDownload),
  })),
  subtotal: Number(raw.subtotal) || 0,
  gst: Number(raw.gst) || 0,
  totalAmount: Number(raw.totalAmount) || 0,
  status: (raw.status || 'Completed') as OrderStatus,
  paymentMethod: raw.paymentMethod || 'UPI / QR Code',
  paymentStatus: raw.paymentStatus || 'Paid',
  createdAt: raw.createdAt || new Date().toISOString(),
});

export const orderService = {
  getOrders(): Order[] {
    return storageService.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  },

  saveOrders(orders: Order[]): void {
    storageService.setItem<Order[]>(STORAGE_KEYS.ORDERS, orders);
  },

  getUserOrders(userId?: string, userEmail?: string): Order[] {
    const orders = this.getOrders();
    // If neither is provided, return all local orders (for guest)
    if (!userId && !userEmail) {
      return orders;
    }
    return orders.filter(
      (o) =>
        (userId && o.userId === userId) ||
        (userEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase()) ||
        o.userId === 'guest_user'
    );
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderId === id);
  },

  createOrder(data: Omit<Order, 'id' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...data,
      id: generateId('ord'),
      createdAt: new Date().toISOString(),
    };

    const updated = [newOrder, ...orders];
    this.saveOrders(updated);

    // Sync to backend asynchronously
    this.syncOrderToBackend(newOrder).catch((err) => {
      console.warn('Backend order sync warning:', err);
    });

    return newOrder;
  },

  async createOrderAsync(data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const orders = this.getOrders();
    const orderId = generateId('ord');
    const newOrder: Order = {
      ...data,
      id: orderId,
      orderId: orderId,
      createdAt: new Date().toISOString(),
    };

    // Save locally immediately
    const updated = [newOrder, ...orders];
    this.saveOrders(updated);

    // Sync to backend and await confirmation
    const synced = await this.syncOrderToBackend(newOrder);
    return synced || newOrder;
  },

  async syncOrderToBackend(order: Order): Promise<Order | null> {
    try {
      const payload = {
        ...order,
        orderId: order.orderId || order.id,
      };

      const { response, data } = await apiRequest<BackendOrderResponse>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok && data.success && data.order) {
        const synced = mapBackendOrder(data.order);
        // Update local storage with backend assigned details
        const orders = this.getOrders();
        const index = orders.findIndex((o) => o.id === order.id || o.id === synced.id);
        if (index !== -1) {
          orders[index] = synced;
        } else {
          orders.unshift(synced);
        }
        this.saveOrders(orders);
        return synced;
      } else {
        console.warn('Backend rejected order creation:', data.message);
      }
    } catch (err) {
      console.error('Failed to sync order to backend:', err);
    }
    return null;
  },

  async fetchUserOrders(userId?: string, userEmail?: string): Promise<Order[]> {
    try {
      const { response, data } = await apiRequest<BackendOrderResponse>('/orders/my-orders');
      if (response.ok && data.success && Array.isArray(data.orders)) {
        const backendOrders = data.orders.map(mapBackendOrder);
        // Merge with local storage orders
        const localOrders = this.getOrders();
        const mergedMap = new Map<string, Order>();
        backendOrders.forEach((o) => mergedMap.set(o.id, o));
        localOrders.forEach((o) => {
          if (!mergedMap.has(o.id)) {
            mergedMap.set(o.id, o);
          }
        });
        const combined = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.saveOrders(combined);
        return combined;
      }
    } catch {
      // Fallback to local
    }
    return this.getUserOrders(userId, userEmail);
  },

  async fetchAdminOrders(): Promise<Order[]> {
    try {
      const { response, data } = await apiRequest<BackendOrderResponse>('/orders/admin');
      if (response.ok && data.success && Array.isArray(data.orders)) {
        const backendOrders = data.orders.map(mapBackendOrder);
        this.saveOrders(backendOrders);
        return backendOrders;
      }
    } catch {
      // Fallback
    }
    return this.getOrders();
  },

  updateOrderStatus(orderId: string, status: OrderStatus): { success: boolean; order?: Order; error?: string } {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderId === orderId);

    if (index === -1) {
      return { success: false, error: 'Order not found.' };
    }

    const updatedOrder = { ...orders[index], status };
    orders[index] = updatedOrder;
    this.saveOrders(orders);

    // Sync status change to backend
    void apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).catch((err) => console.warn('Failed to sync order status to backend:', err));

    return { success: true, order: updatedOrder };
  },
};

export default orderService;
