import { apiRequest } from './apiClient';
import type { Order, OrderStatus } from '../types/order';

interface PaymentOrderResponse {
  message?: string;
  order?: Order;
  orders?: Order[];
}

interface InitiatePaymentResponse {
  message?: string;
  merchantOrderId?: string;
  redirectUrl?: string;
  freeCheckout?: boolean;
  amount?: number;
}

export interface CheckoutPaymentInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  couponCode?: string;
  items: Array<{ productId: string; quantity: number }>;
}

export const paymentService = {
  async initiate(input: CheckoutPaymentInput): Promise<InitiatePaymentResponse> {
    const { response, data } = await apiRequest<InitiatePaymentResponse>('/payments/phonepe/initiate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!response.ok || !data.redirectUrl) {
      throw new Error(data.message || 'Unable to start PhonePe payment.');
    }
    return data;
  },

  async getStatus(merchantOrderId: string): Promise<Order> {
    const { response, data } = await apiRequest<PaymentOrderResponse>(
      `/payments/phonepe/status/${encodeURIComponent(merchantOrderId)}`
    );
    if (!response.ok || !data.order) {
      throw new Error(data.message || 'Unable to confirm payment status.');
    }
    return data.order;
  },

  async myOrders(): Promise<Order[]> {
    const { response, data } = await apiRequest<PaymentOrderResponse>('/payments/orders/mine');
    if (!response.ok || !data.orders) {
      throw new Error(data.message || 'Unable to load orders.');
    }
    return data.orders;
  },

  async adminOrders(): Promise<Order[]> {
    const { response, data } = await apiRequest<PaymentOrderResponse>('/payments/orders');
    if (!response.ok || !data.orders) {
      throw new Error(data.message || 'Unable to load orders.');
    }
    return data.orders;
  },

  async updateStatus(merchantOrderId: string, status: OrderStatus): Promise<Order> {
    const { response, data } = await apiRequest<PaymentOrderResponse>(
      `/payments/orders/${encodeURIComponent(merchantOrderId)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok || !data.order) {
      throw new Error(data.message || 'Unable to update the order.');
    }
    return data.order;
  },
};
