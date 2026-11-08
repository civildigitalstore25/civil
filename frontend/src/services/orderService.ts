import { STORAGE_KEYS, storageService } from './storageService';
import type { Order, OrderStatus } from '../types/order';
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
  paymentMethod: raw.paymentMethod || '-',
  paymentStatus: raw.paymentStatus || 'Paid',
  createdAt: raw.createdAt || new Date().toISOString(),
  updatedAt: raw.updatedAt || undefined,
  paidAt: raw.paidAt || undefined,
  couponCode: raw.couponCode || '',
  couponDiscount: Number(raw.couponDiscount) || 0,
  phonepeOrderId: raw.phonepeOrderId || '',
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

  /** Single order for its owner (GET /api/orders/:id checks ownership by user id / email). */
  async fetchOrder(orderId: string): Promise<{ order: Order | null; status: number; error?: string }> {
    try {
      const { response, data } = await apiRequest<BackendOrderResponse>(`/orders/${encodeURIComponent(orderId)}`);
      if (response.ok && data.success && data.order) return { order: mapBackendOrder(data.order), status: response.status };
      return { order: null, status: response.status, error: data.message || 'Order not found' };
    } catch (err: any) {
      return { order: null, status: 0, error: err?.message || 'Network error' };
    }
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

  importOrders(imported: Partial<Order>[]): { inserted: number; updated: number; orders: Order[] } {
    const currentOrders = this.getOrders();
    const map = new Map<string, Order>();
    currentOrders.forEach((o) => {
      map.set(o.id, o);
      if (o.orderId) map.set(o.orderId, o);
    });

    let inserted = 0;
    let updated = 0;

    for (const item of imported) {
      const orderId = String(
        item.id || item.orderId || `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      ).trim();
      const existing = map.get(orderId);

      const normalizedStatus: OrderStatus = (() => {
        const s = (item.status || '').toLowerCase().trim();
        if (s === 'completed' || s === 'paid' || s === 'success' || s === 'delivered') return 'Completed';
        if (s === 'processing' || s === 'in progress') return 'Processing';
        if (s === 'cancelled' || s === 'canceled' || s === 'failed' || s === 'rejected') return 'Cancelled';
        return 'Pending';
      })();

      const totalVal = Number(item.totalAmount ?? (existing?.totalAmount ?? 0));
      const subtotalVal = Number(item.subtotal ?? (existing?.subtotal ?? Math.round(totalVal / 1.18)));
      const gstVal = Number(item.gst ?? (existing?.gst ?? (totalVal - subtotalVal)));

      const orderObj: Order = {
        id: orderId,
        orderId,
        userId: item.userId || existing?.userId || 'guest_user',
        customerName: item.customerName || existing?.customerName || 'Valued Customer',
        customerEmail: item.customerEmail || existing?.customerEmail || '',
        customerPhone: item.customerPhone || existing?.customerPhone || '',
        shippingAddress: item.shippingAddress !== undefined ? item.shippingAddress : (existing?.shippingAddress || ''),
        items: item.items && item.items.length > 0 ? item.items : (existing?.items || [
          {
            productId: 'imported-product',
            title: 'Civil Engineering Package',
            price: totalVal,
            quantity: 1,
            fileFormat: 'ZIP Download',
            hasDownload: true,
          }
        ]),
        subtotal: subtotalVal,
        gst: gstVal,
        totalAmount: totalVal,
        status: normalizedStatus,
        paymentMethod: item.paymentMethod || existing?.paymentMethod || 'Online',
        paymentStatus: item.paymentStatus || (normalizedStatus === 'Completed' ? 'Paid' : 'Pending'),
        createdAt: item.createdAt || existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existing) {
        updated++;
      } else {
        inserted++;
      }
      map.set(orderId, orderObj);

      // Best effort backend sync for status
      void apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: normalizedStatus }),
      }).catch(() => {});
    }

    // Deduplicate unique orders
    const uniqueOrders = Array.from(new Set(map.values())).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.saveOrders(uniqueOrders);
    return { inserted, updated, orders: uniqueOrders };
  },
};

export default orderService;
