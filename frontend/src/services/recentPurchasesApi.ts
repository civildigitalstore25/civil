import { apiRequest } from './apiClient';

export type RecentPurchase = {
  buyerName: string;
  productTitle: string;
  productImage: string;
  productId: string;
  purchasedAt: string;
};

export async function fetchRecentPurchases(limit = 12): Promise<RecentPurchase[]> {
  try {
    const { response, data } = await apiRequest<{
      success?: boolean;
      purchases?: RecentPurchase[];
    }>(`/orders/recent-purchases?limit=${limit}`);
    if (!response.ok || !Array.isArray(data.purchases)) return [];
    return data.purchases.filter(
      (p) => p?.buyerName && p?.productTitle && p?.purchasedAt,
    );
  } catch {
    return [];
  }
}
