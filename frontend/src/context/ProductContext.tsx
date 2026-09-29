import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product } from '../types/product';
import { productService } from '../services/productService';

interface ProductContextType {
  products: Product[];
  refreshProducts: () => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (data: Partial<Product> & { name: string; price: number }, isDraft?: boolean) => { success: boolean; product?: Product; error?: string };
  updateProduct: (id: string, data: Partial<Product>, isDraft?: boolean) => { success: boolean; product?: Product; error?: string };
  deleteProduct: (id: string) => { success: boolean; error?: string };
  bulkDeleteProducts: (ids: string[]) => { success: boolean; count: number };
  toggleBestSeller: (id: string) => void;
  toggleOutOfStock: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());

  const refreshProducts = useCallback(() => {
    setProducts(productService.getProducts());
  }, []);

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

  const addProduct = useCallback((data: Partial<Product> & { name: string; price: number }, isDraft = false) => {
    const result = productService.addProduct(data, isDraft);
    if (result.success) {
      setProducts(productService.getProducts());
    }
    return result;
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>, isDraft = false) => {
    const result = productService.updateProduct(id, data, isDraft);
    if (result.success) {
      setProducts(productService.getProducts());
    }
    return result;
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const result = productService.deleteProduct(id);
    if (result.success) {
      setProducts(productService.getProducts());
    }
    return result;
  }, []);

  const bulkDeleteProducts = useCallback((ids: string[]) => {
    const result = productService.bulkDeleteProducts(ids);
    if (result.success) {
      setProducts(productService.getProducts());
    }
    return result;
  }, []);

  const toggleBestSeller = useCallback((id: string) => {
    const result = productService.toggleBestSeller(id);
    if (result.success) {
      setProducts(productService.getProducts());
    }
  }, []);

  const toggleOutOfStock = useCallback((id: string) => {
    const result = productService.toggleOutOfStock(id);
    if (result.success) {
      setProducts(productService.getProducts());
    }
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
