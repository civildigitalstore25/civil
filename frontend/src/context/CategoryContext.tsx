import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CategoryDefinition } from '../data/categories';
import { categoryService } from '../services/categoryService';

interface CategoryContextType {
  categories: CategoryDefinition[];
  refreshCategories: () => void;
  getCategoryBySlug: (slug: string) => CategoryDefinition | undefined;
  addCategory: (data: Partial<CategoryDefinition> & { name: string }) => { success: boolean; category?: CategoryDefinition; error?: string };
  updateCategory: (targetSlug: string, data: Partial<CategoryDefinition>) => { success: boolean; category?: CategoryDefinition; error?: string };
  deleteCategory: (slug: string) => { success: boolean; error?: string; productCount?: number };
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => categoryService.getCategories());

  const refreshCategories = useCallback(() => {
    setCategories(categoryService.getCategories());
  }, []);

  const getCategoryBySlug = useCallback(
    (slug: string) => {
      const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
      return categories.find((c) => c.slug.toLowerCase() === normalized);
    },
    [categories]
  );

  const addCategory = useCallback((data: Partial<CategoryDefinition> & { name: string }) => {
    const result = categoryService.addCategory(data);
    if (result.success) {
      setCategories(categoryService.getCategories());
    }
    return result;
  }, []);

  const updateCategory = useCallback((targetSlug: string, data: Partial<CategoryDefinition>) => {
    const result = categoryService.updateCategory(targetSlug, data);
    if (result.success) {
      setCategories(categoryService.getCategories());
    }
    return result;
  }, []);

  const deleteCategory = useCallback((slug: string) => {
    const result = categoryService.deleteCategory(slug);
    if (result.success) {
      setCategories(categoryService.getCategories());
    }
    return result;
  }, []);

  const contextValue = useMemo(
    () => ({
      categories,
      refreshCategories,
      getCategoryBySlug,
      addCategory,
      updateCategory,
      deleteCategory,
    }),
    [categories, refreshCategories, getCategoryBySlug, addCategory, updateCategory, deleteCategory]
  );

  return <CategoryContext.Provider value={contextValue}>{children}</CategoryContext.Provider>;
};

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export default CategoryContext;
