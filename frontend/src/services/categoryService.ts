import { STORAGE_KEYS, storageService } from './storageService';
import type { CategoryDefinition } from '../data/categories';
import { productService } from './productService';
import { slugify } from '../utils/slugify';

export const categoryService = {
  getCategories(): CategoryDefinition[] {
    return storageService.getItem<CategoryDefinition[]>(STORAGE_KEYS.CATEGORIES, []);
  },

  saveCategories(categories: CategoryDefinition[]): void {
    storageService.setItem<CategoryDefinition[]>(STORAGE_KEYS.CATEGORIES, categories);
  },

  getCategoryBySlug(slug: string): CategoryDefinition | undefined {
    const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    return this.getCategories().find((c) => c.slug.toLowerCase() === normalized);
  },

  addCategory(data: Partial<CategoryDefinition> & { name: string }): { success: boolean; category?: CategoryDefinition; error?: string } {
    const categories = this.getCategories();
    const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

    if (categories.some((c) => c.slug.toLowerCase() === generatedSlug.toLowerCase())) {
      return { success: false, error: `Category slug "${generatedSlug}" already exists.` };
    }

    const newCategory: CategoryDefinition = {
      name: data.name.trim(),
      slug: generatedSlug,
      filterType: data.filterType || 'software',
      filterValue: (data.filterValue || data.name.trim()) as any,
      description: data.description || `${data.name} files and digital resources for civil engineers.`
    };

    const updated = [...categories, newCategory];
    this.saveCategories(updated);

    return { success: true, category: newCategory };
  },

  updateCategory(targetSlug: string, data: Partial<CategoryDefinition>): { success: boolean; category?: CategoryDefinition; error?: string } {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.slug.toLowerCase() === targetSlug.toLowerCase());

    if (index === -1) {
      return { success: false, error: 'Category not found.' };
    }

    if (data.slug) {
      const newSlug = slugify(data.slug);
      const duplicate = categories.find((c) => c.slug.toLowerCase() !== targetSlug.toLowerCase() && c.slug.toLowerCase() === newSlug.toLowerCase());
      if (duplicate) {
        return { success: false, error: `Category slug "${newSlug}" is already taken.` };
      }
      data.slug = newSlug;
    }

    const updatedCategory: CategoryDefinition = {
      ...categories[index],
      ...data
    };

    categories[index] = updatedCategory;
    this.saveCategories(categories);

    return { success: true, category: updatedCategory };
  },

  deleteCategory(slug: string): { success: boolean; error?: string; productCount?: number } {
    const categories = this.getCategories();
    const targetCat = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());

    if (!targetCat) {
      return { success: false, error: 'Category not found.' };
    }

    // Check if products belong to this category
    const products = productService.getProducts();
    const matchingProducts = products.filter(
      (p) =>
        p.categorySlug.toLowerCase() === targetCat.slug.toLowerCase() ||
        p.category.toLowerCase() === targetCat.name.toLowerCase() ||
        p.software.toLowerCase() === targetCat.name.toLowerCase()
    );

    if (matchingProducts.length > 0) {
      return {
        success: false,
        error: `Cannot delete category "${targetCat.name}" because it contains ${matchingProducts.length} product(s). Reassign or delete products first.`,
        productCount: matchingProducts.length
      };
    }

    const updated = categories.filter((c) => c.slug.toLowerCase() !== slug.toLowerCase());
    this.saveCategories(updated);

    return { success: true };
  }
};
