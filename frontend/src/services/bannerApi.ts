import { apiRequest } from './apiClient';

export type BannerSlot = 'left' | 'right';

export interface BannerRecord {
  id: string;
  slot: BannerSlot;
  imageUrl: string;
  linkUrl: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  altText: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BannerInput {
  slot: BannerSlot;
  imageUrl: string;
  linkUrl: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  altText?: string;
}

interface BannerResponse {
  success: boolean;
  banners?: BannerRecord[];
  banner?: BannerRecord;
  message?: string;
}

export const bannerApi = {
  async listActive(): Promise<BannerRecord[]> {
    const { response, data } = await apiRequest<BannerResponse>('/banners');
    if (!response.ok || !data.banners) throw new Error(data.message || 'Failed to load banners');
    return data.banners;
  },

  async listAll(): Promise<BannerRecord[]> {
    const { response, data } = await apiRequest<BannerResponse>('/banners/manage');
    if (!response.ok || !data.banners) throw new Error(data.message || 'Failed to load banners');
    return data.banners;
  },

  async create(input: BannerInput): Promise<BannerRecord> {
    const { response, data } = await apiRequest<BannerResponse>('/banners', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!response.ok || !data.banner) throw new Error(data.message || 'Failed to add banner');
    return data.banner;
  },

  async update(
    id: string,
    input: Partial<Pick<BannerRecord, 'slot' | 'imageUrl' | 'linkUrl' | 'headline' | 'subheadline' | 'ctaLabel' | 'altText' | 'isActive'>>,
  ): Promise<BannerRecord> {
    const { response, data } = await apiRequest<BannerResponse>(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    if (!response.ok || !data.banner) throw new Error(data.message || 'Failed to update banner');
    return data.banner;
  },

  async remove(id: string): Promise<void> {
    const { response, data } = await apiRequest<BannerResponse>(`/banners/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(data.message || 'Failed to remove banner');
  },
};
