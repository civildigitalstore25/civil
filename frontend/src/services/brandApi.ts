import { apiRequest } from './apiClient';

export interface BrandCategory {
  name: string;
  slug: string;
}

export interface BrandRecord {
  _id: string;
  name: string;
  slug: string;
  categories: BrandCategory[];
}

interface BrandResponse {
  success: boolean;
  brands?: BrandRecord[];
  brand?: BrandRecord;
  message?: string;
}

export const brandApi = {
  async list(): Promise<BrandRecord[]> {
    const { response, data } = await apiRequest<BrandResponse>('/brands');
    if (!response.ok || !data.brands) throw new Error(data.message || 'Failed to load brands');
    return data.brands;
  },

  async create(name: string): Promise<BrandRecord> {
    const { response, data } = await apiRequest<BrandResponse>('/brands', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!response.ok || !data.brand) throw new Error(data.message || 'Failed to add brand');
    return data.brand;
  },

  async addCategory(brandId: string, name: string): Promise<BrandRecord> {
    const { response, data } = await apiRequest<BrandResponse>(`/brands/${brandId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!response.ok || !data.brand) throw new Error(data.message || 'Failed to add category');
    return data.brand;
  },

  async removeCategory(brandId: string, slug: string): Promise<void> {
    const { response, data } = await apiRequest<BrandResponse>(`/brands/${brandId}/categories/${slug}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(data.message || 'Failed to remove category');
  },

  async remove(brandId: string): Promise<void> {
    const { response, data } = await apiRequest<BrandResponse>(`/brands/${brandId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(data.message || 'Failed to remove brand');
  },
};
