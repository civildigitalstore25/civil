import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Product } from '../types/product';
import { productService } from '../services/productService';
import { productApi } from '../services/productApi';

interface ProductContextType {
  products: Product[];
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
  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());

  const replaceProducts = useCallback((next: Product[]) => {
    productService.saveProducts(next);
    setProducts(next);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const next = await productApi.list();
      replaceProducts(next);
    } catch {
      setProducts(productService.getProducts());
    }
  }, [replaceProducts]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const getProductBySlug = useCallback(
    (slug: string) => {
      const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
      return products.find(
        (p) =>
          p.slug.toLowerCase() === normalized ||
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
        setProducts((current) => {
          const next = [result.product as Product, ...current];
          productService.saveProducts(next);
          return next;
        });
      }
      return result;
    } catch {
      return productService.addProduct(data, isDraft);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>, isDraft = false) => {
    try {
      const result = await productApi.update(id, data, isDraft);
      if (result.success && result.product) {
        setProducts((current) => {
          const next = current.map((item) => (item.id === id || item._id === id ? (result.product as Product) : item));
          productService.saveProducts(next);
          return next;
        });
      }
      return result;
    } catch {
      return productService.updateProduct(id, data, isDraft);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const result = await productApi.remove(id);
      if (result.success) {
        setProducts((current) => {
          const next = current.filter((item) => item.id !== id && item._id !== id);
          productService.saveProducts(next);
          return next;
        });
      }
      return result;
    } catch {
      return productService.deleteProduct(id);
    }
  }, []);

  const bulkDeleteProducts = useCallback(async (ids: string[]) => {
    try {
      const result = await productApi.bulkRemove(ids);
      if (result.success) {
        setProducts((current) => {
          const idSet = new Set(ids);
          const next = current.filter((item) => !idSet.has(item.id) && !idSet.has(item._id || ''));
          productService.saveProducts(next);
          return next;
        });
      }
      return result;
    } catch {
      return productService.bulkDeleteProducts(ids);
    }
  }, []);

  const toggleBestSeller = useCallback((id: string) => {
    void productApi.toggle(id, 'bestseller').then((product) => {
      if (!product) return;
      setProducts((current) => {
        const next = current.map((item) => (item.id === id || item._id === id ? product : item));
        productService.saveProducts(next);
        return next;
      });
    });
  }, []);

  const toggleOutOfStock = useCallback((id: string) => {
    void productApi.toggle(id, 'outofstock').then((product) => {
      if (!product) return;
      setProducts((current) => {
        const next = current.map((item) => (item.id === id || item._id === id ? product : item));
        productService.saveProducts(next);
        return next;
      });
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      products,
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
