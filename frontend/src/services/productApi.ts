import { apiRequest } from './apiClient';
import type { Product } from '../types/product';

interface ProductListResponse {
  success: boolean;
  products?: Product[];
  message?: string;
}

interface ProductMutationResponse {
  success: boolean;
  product?: Product;
  message?: string;
  error?: string;
}

const emptySpec = {
  format: '',
  fileSize: '',
  software: '',
  version: '',
  compatibility: '',
  delivery: '',
  access: '',
};

export const mapProduct = (raw: Product & { _id?: string }): Product => {
  const id = String(raw.id || raw._id || '');
  const images =
    raw.images && raw.images.length > 0
      ? raw.images
      : ([raw.imageUrl, ...(raw.additionalImages || [])].filter(Boolean) as string[]);

  return {
    ...raw,
    id,
    _id: id,
    images,
    format: raw.format || '',
    fileSize: raw.fileSize || '',
    software: raw.software || raw.brand || '',
    description: raw.description?.length ? raw.description : raw.longDescription ? [raw.longDescription] : [],
    specifications: raw.specifications || emptySpec,
    compatibility: raw.compatibility || {
      supportedSoftware: '',
      compatibleVersions: '',
      os: '',
      fileTypes: '',
      requirements: '',
    },
    reviews: raw.reviews || [],
    seoKeywords: raw.seoKeywords || [],
  };
};

const readError = (data: ProductMutationResponse, fallback: string) =>
  data.message || data.error || fallback;

export const productApi = {
  async list(): Promise<Product[]> {
    const { response, data } = await apiRequest<ProductListResponse>('/products?limit=500');
    if (!response.ok || !data.products) {
      throw new Error(data.message || 'Failed to load products');
    }
    return data.products.map((product) => mapProduct(product));
  },

  async create(
    payload: Partial<Product> & { name: string; price: number },
    isDraft = false,
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    const { response, data } = await apiRequest<ProductMutationResponse>('/products', {
      method: 'POST',
      body: JSON.stringify({ ...payload, status: isDraft ? 'draft' : payload.status || 'active' }),
    });
    if (!response.ok || !data.product) {
      return { success: false, error: readError(data, 'Failed to create product') };
    }
    return { success: true, product: mapProduct(data.product) };
  },

  async update(
    id: string,
    payload: Partial<Product>,
    isDraft = false,
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    const { response, data } = await apiRequest<ProductMutationResponse>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...payload,
        status: isDraft ? 'draft' : payload.status,
      }),
    });
    if (!response.ok || !data.product) {
      return { success: false, error: readError(data, 'Failed to update product') };
    }
    return { success: true, product: mapProduct(data.product) };
  },

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    const { response, data } = await apiRequest<ProductMutationResponse>(`/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) return { success: false, error: readError(data, 'Failed to delete product') };
    return { success: true };
  },

  async bulkRemove(ids: string[]): Promise<{ success: boolean; count: number }> {
    const { response } = await apiRequest<ProductMutationResponse>('/products/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    return { success: response.ok, count: response.ok ? ids.length : 0 };
  },

  async toggle(id: string, kind: 'bestseller' | 'outofstock'): Promise<Product | null> {
    const path =
      kind === 'bestseller'
        ? `/products/${id}/toggle-bestseller`
        : `/products/${id}/toggle-outofstock`;
    const { response, data } = await apiRequest<ProductMutationResponse>(path, { method: 'PATCH' });
    return response.ok && data.product ? mapProduct(data.product) : null;
  },
};
