import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Product } from '../types/product';
import { productApi } from '../services/productApi';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (data: Partial<Product> & { name: string; price: number }, isDraft?: boolean) => Promise<{ success: boolean; product?: Product; error?: string }>;
  updateProduct: (id: string, data: Partial<Product>, isDraft?: boolean) => Promise<{ success: boolean; product?: Product; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  bulkDeleteProducts: (ids: string[]) => Promise<{ success: boolean; count: number }>;
  toggleBestSeller: (id: string) => void;
  toggleOutOfStock: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      const next = await productApi.list();
      setProducts(next);
    } catch (error) {
      console.error('Failed to load products from backend:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const getProductBySlug = useCallback(
    (slug: string) => {
      const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
      return products.find(
        (p) =>
          p.slug.toLowerCase() === normalized ||
          p.id.toLowerCase() === normalized ||
          p.aliases?.some((alias) => alias.toLowerCase() === normalized)
      );
    },
    [products]
  );

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id || p._id === id);
    },
    [products]
  );

  const addProduct = useCallback(async (data: Partial<Product> & { name: string; price: number }, isDraft = false) => {
    try {
      const result = await productApi.create(data, isDraft);
      if (result.success && result.product) {
        setProducts((current) => [result.product as Product, ...current]);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product'
      };
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>, isDraft = false) => {
    try {
      const result = await productApi.update(id, data, isDraft);
      if (result.success && result.product) {
        setProducts((current) =>
          current.map((item) => (item.id === id || item._id === id ? (result.product as Product) : item))
        );
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product'
      };
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const result = await productApi.remove(id);
      if (result.success) {
        setProducts((current) => current.filter((item) => item.id !== id && item._id !== id));
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product'
      };
    }
  }, []);

  const bulkDeleteProducts = useCallback(async (ids: string[]) => {
    try {
      const result = await productApi.bulkRemove(ids);
      if (result.success) {
        const idSet = new Set(ids);
        setProducts((current) => current.filter((item) => !idSet.has(item.id) && !idSet.has(item._id || '')));
      }
      return result;
    } catch {
      return { success: false, count: 0 };
    }
  }, []);

  const toggleBestSeller = useCallback((id: string) => {
    void productApi.toggle(id, 'bestseller').then((product) => {
      if (!product) return;
      setProducts((current) =>
        current.map((item) => (item.id === id || item._id === id ? product : item))
      );
    });
  }, []);

  const toggleOutOfStock = useCallback((id: string) => {
    void productApi.toggle(id, 'outofstock').then((product) => {
      if (!product) return;
      setProducts((current) =>
        current.map((item) => (item.id === id || item._id === id ? product : item))
      );
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      products,
      loading,
      refreshProducts,
      getProductBySlug,
      getProductById,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkDeleteProducts,
      toggleBestSeller,
      toggleOutOfStock,
    }),
    [
      products,
      loading,
      refreshProducts,
      getProductBySlug,
      getProductById,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkDeleteProducts,
      toggleBestSeller,
      toggleOutOfStock,
    ]
  );

  return <ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>;
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;
