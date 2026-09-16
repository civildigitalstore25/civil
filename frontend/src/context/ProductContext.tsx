import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product } from '../types/product';
import { productService } from '../services/productService';

interface ProductContextType {
  products: Product[];
  refreshProducts: () => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (data: Partial<Product> & { name: string; price: number }) => { success: boolean; product?: Product; error?: string };
  updateProduct: (id: string, data: Partial<Product>) => { success: boolean; product?: Product; error?: string };
  deleteProduct: (id: string) => { success: boolean; error?: string };
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
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const addProduct = useCallback((data: Partial<Product> & { name: string; price: number }) => {
    const result = productService.addProduct(data);
    if (result.success) {
      setProducts(productService.getProducts());
    }
    return result;
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    const result = productService.updateProduct(id, data);
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

  const contextValue = useMemo(
    () => ({
      products,
      refreshProducts,
      getProductBySlug,
      getProductById,
      addProduct,
      updateProduct,
      deleteProduct,
    }),
    [products, refreshProducts, getProductBySlug, getProductById, addProduct, updateProduct, deleteProduct]
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
