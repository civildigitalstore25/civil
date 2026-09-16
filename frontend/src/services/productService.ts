import { STORAGE_KEYS, storageService } from './storageService';
import type { Product } from '../types/product';
import { generateId } from '../utils/generateId';
import { slugify } from '../utils/slugify';

export const productService = {
  getProducts(): Product[] {
    return storageService.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },

  saveProducts(products: Product[]): void {
    storageService.setItem<Product[]>(STORAGE_KEYS.PRODUCTS, products);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  getProductBySlug(slug: string): Product | undefined {
    const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    return this.getProducts().find(
      (p) =>
        p.slug.toLowerCase() === normalized ||
        p.aliases?.some((alias) => alias.toLowerCase() === normalized)
    );
  },

  addProduct(data: Partial<Product> & { name: string; price: number }): { success: boolean; product?: Product; error?: string } {
    const products = this.getProducts();

    const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

    // Check slug uniqueness
    if (products.some((p) => p.slug.toLowerCase() === generatedSlug.toLowerCase())) {
      return { success: false, error: `Product slug "${generatedSlug}" already exists. Please choose a unique slug or name.` };
    }

    const price = Number(data.price) || 0;
    const oldPrice = Number(data.oldPrice) || price;
    const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : (data.discountPercent || 0);

    const newProduct: Product = {
      id: generateId('prod'),
      slug: generatedSlug,
      categorySlug: data.categorySlug || 'softwares',
      name: data.name,
      category: data.category || 'Softwares',
      software: data.software || 'AutoCAD',
      format: data.format || 'ZIP',
      fileSize: data.fileSize || '100 MB',
      price,
      oldPrice,
      discountPercent,
      rating: data.rating || 4.8,
      reviewCount: data.reviewCount || 1,
      downloadsCount: data.downloadsCount || 0,
      badge: data.badge || 'New',
      isBestSeller: data.isBestSeller ?? false,
      isNewArrival: data.isNewArrival ?? false,
      createdAt: data.createdAt || new Date().toISOString(),
      status: data.status || 'active',
      shortDescription: data.shortDescription || data.name,
      description: data.description && data.description.length > 0 ? data.description : [data.shortDescription || data.name],
      includedFiles: data.includedFiles || ['Digital Download Files'],
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'],
      specifications: data.specifications || {
        format: data.format || 'ZIP',
        fileSize: data.fileSize || '100 MB',
        software: data.software || 'AutoCAD',
        version: 'Latest',
        compatibility: 'Windows 10/11',
        delivery: 'Instant Digital Download',
        access: 'Lifetime Unlimited'
      },
      compatibility: data.compatibility || {
        supportedSoftware: data.software || 'AutoCAD',
        compatibleVersions: 'All Recent Versions',
        os: 'Windows 10 / 11 (64-bit)',
        fileTypes: data.format || 'ZIP',
        requirements: '4GB RAM, Standalone Software'
      },
      reviews: data.reviews || []
    };

    const updatedProducts = [newProduct, ...products];
    this.saveProducts(updatedProducts);

    return { success: true, product: newProduct };
  },

  updateProduct(id: string, data: Partial<Product>): { success: boolean; product?: Product; error?: string } {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, error: 'Product not found.' };
    }

    if (data.slug) {
      const newSlug = slugify(data.slug);
      const duplicate = products.find((p) => p.id !== id && p.slug.toLowerCase() === newSlug.toLowerCase());
      if (duplicate) {
        return { success: false, error: `Product slug "${newSlug}" is already taken by another product.` };
      }
      data.slug = newSlug;
    }

    const price = data.price !== undefined ? Number(data.price) : products[index].price;
    const oldPrice = data.oldPrice !== undefined ? Number(data.oldPrice) : products[index].oldPrice;
    let discountPercent = products[index].discountPercent;
    if (oldPrice > price) {
      discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    const updatedProduct: Product = {
      ...products[index],
      ...data,
      price,
      oldPrice,
      discountPercent
    };

    products[index] = updatedProduct;
    this.saveProducts(products);

    return { success: true, product: updatedProduct };
  },

  deleteProduct(id: string): { success: boolean; error?: string } {
    const products = this.getProducts();
    const exists = products.some((p) => p.id === id);

    if (!exists) {
      return { success: false, error: 'Product not found.' };
    }

    const updatedProducts = products.filter((p) => p.id !== id);
    this.saveProducts(updatedProducts);

    return { success: true };
  },

  getBestSellers(): Product[] {
    return this.getProducts()
      .filter((p) => (p.isBestSeller || p.badge === 'Bestseller') && p.status !== 'inactive')
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
  },

  getNewArrivals(): Product[] {
    return this.getProducts()
      .filter((p) => (p.isNewArrival || p.badge === 'New') && p.status !== 'inactive')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  getProductsByCategory(categorySlug: string): Product[] {
    const norm = categorySlug.trim().toLowerCase();
    return this.getProducts().filter(
      (p) => p.status !== 'inactive' && (p.categorySlug?.toLowerCase() === norm || p.category?.toLowerCase() === norm || p.software?.toLowerCase() === norm)
    );
  }
};
