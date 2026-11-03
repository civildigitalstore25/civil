import { apiRequest } from './apiClient';

export interface CheckoutPaymentInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  couponCode?: string;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
    fileFormat?: string;
  }>;
}

export interface InitiatePaymentResponse {
  success?: boolean;
  message?: string;
  merchantOrderId?: string;
  redirectUrl?: string;
  freeCheckout?: boolean;
  amount?: number;
}

export interface PaymentStatusOrder {
  orderId: string;
  customerEmail: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  items: Array<{ title: string; quantity: number; price: number }>;
}

const safeRequest = async <T>(path: string, options?: RequestInit) => {
  try {
    return await apiRequest<T>(path, options);
  } catch {
    throw new Error('Could not reach the server. Please check that the backend is running and try again.');
  }
};

export const paymentService = {
  async initiate(input: CheckoutPaymentInput): Promise<InitiatePaymentResponse> {
    const { response, data } = await safeRequest<InitiatePaymentResponse>('/payments/phonepe/initiate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!response.ok || !data.success || !data.redirectUrl) {
      throw new Error(data.message || 'Unable to start PhonePe payment.');
    }
    return data;
  },

  async getStatus(merchantOrderId: string): Promise<PaymentStatusOrder> {
    const { response, data } = await safeRequest<{ success?: boolean; message?: string; order?: PaymentStatusOrder }>(
      `/payments/phonepe/status/${encodeURIComponent(merchantOrderId)}`,
    );
    if (!response.ok || !data.order) {
      throw new Error(data.message || 'Unable to confirm payment status.');
    }
    return data.order;
  },
};

export default paymentService;