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
    return this.getProducts().find((p) => p.id === id || p._id === id);
  },

  getProductBySlug(slug: string): Product | undefined {
    const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    return this.getProducts().find(
      (p) =>
        p.slug.toLowerCase() === normalized ||
        p.aliases?.some((alias) => alias.toLowerCase() === normalized)
    );
  },

  addProduct(data: Partial<Product> & { name: string; price: number }, isDraft = false): { success: boolean; product?: Product; error?: string } {
    const products = this.getProducts();

    const generatedSlug = data.slug
      ? slugify(data.slug)
      : slugify(data.version ? `${data.name} ${data.version}` : data.name || 'product');

    // Check slug uniqueness unless draft without name/slug
    if (!isDraft && products.some((p) => p.slug.toLowerCase() === generatedSlug.toLowerCase())) {
      return { success: false, error: `Product slug "${generatedSlug}" already exists. Please choose a unique slug or name.` };
    }

    const price = Number(data.price) || 0;
    const oldPrice = Number(data.oldPrice) || price;
    const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : (data.discountPercent || 0);

    const newProduct: Product = {
      id: generateId('prod'),
      slug: generatedSlug,
      categorySlug: data.categorySlug || 'softwares',
      name: data.name || 'Untitled Draft',
      version: data.version || '',
      category: data.category || 'Softwares',
      software: data.software || 'AutoCAD',
      brand: data.brand || data.software || 'AutoCAD',
      company: data.company || '',
      format: data.format || 'ZIP',
      fileSize: data.fileSize || '100 MB',
      price,
      oldPrice,
      discountPercent,
      rating: data.rating || 4.8,
      reviewCount: data.reviewCount || 1,
      downloadsCount: data.downloadsCount || 0,
      badge: data.badge || '',
      isBestSeller: data.isBestSeller ?? false,
      isNewArrival: data.isNewArrival ?? true,
      isOutOfStock: data.isOutOfStock ?? false,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: isDraft ? 'draft' : data.status || 'active',
      shortDescription: data.shortDescription || data.name,
      longDescription: data.longDescription || '',
      detailsDescription: data.detailsDescription || '',
      description: data.description && data.description.length > 0 ? data.description : [data.shortDescription || data.name],
      includedFiles: data.includedFiles || ['Digital Download Package'],
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'],
      specifications: data.specifications || {
        format: data.format || 'ZIP',
        fileSize: data.fileSize || '100 MB',
        software: data.software || 'AutoCAD',
        version: data.version || 'Latest',
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
      seoTitle: data.seoTitle || '',
      seoDescription: data.seoDescription || '',
      seoKeywords: data.seoKeywords || [],
      keyFeatures: data.keyFeatures || [
        { icon: 'CheckCircle', title: 'High Precision DWG Drawings', description: 'Scalable vector drawings.' }
      ],
      reviews: data.reviews || [],
      subscriptionDurations: data.subscriptionDurations || [],
      subscriptions: data.subscriptions || [],
      ebookPriceINR: data.ebookPriceINR || '',
      ebookPriceUSD: data.ebookPriceUSD || '',
      hasLifetime: data.hasLifetime ?? false,
      lifetimePrice: data.lifetimePrice || '',
      lifetimePriceINR: data.lifetimePriceINR || '',
      lifetimePriceUSD: data.lifetimePriceUSD || '',
      hasMembership: data.hasMembership ?? false,
      membershipPrice: data.membershipPrice || '',
      membershipPriceINR: data.membershipPriceINR || '',
      membershipPriceUSD: data.membershipPriceUSD || '',
      strikethroughPriceINR: data.strikethroughPriceINR || '',
      strikethroughPriceUSD: data.strikethroughPriceUSD || '',
      imageUrl: data.imageUrl || (data.images?.[0] || ''),
      additionalImages: data.additionalImages || [],
      videoUrl: data.videoUrl || '',
      activationVideoUrl: data.activationVideoUrl || '',
      instagramReels: data.instagramReels || [],
      driveLink: data.driveLink || '',
      faqs: data.faqs || [],
      systemRequirements: data.systemRequirements || [],
      isDeal: data.isDeal ?? false,
      dealStartDate: data.dealStartDate || '',
      dealStartTime: data.dealStartTime || '',
      dealEndDate: data.dealEndDate || '',
      dealEndTime: data.dealEndTime || '',
      dealEbookPriceINR: data.dealEbookPriceINR || '',
      dealEbookPriceUSD: data.dealEbookPriceUSD || '',
      dealLifetimePriceINR: data.dealLifetimePriceINR || '',
      dealLifetimePriceUSD: data.dealLifetimePriceUSD || '',
      dealMembershipPriceINR: data.dealMembershipPriceINR || '',
      dealMembershipPriceUSD: data.dealMembershipPriceUSD || '',
      dealSubscriptionDurations: data.dealSubscriptionDurations || [],
      dealSubscriptions: data.dealSubscriptions || [],
      isFreeProduct: data.isFreeProduct ?? false,
      freeProductStartDate: data.freeProductStartDate || '',
      freeProductStartTime: data.freeProductStartTime || '',
      freeProductEndDate: data.freeProductEndDate || '',
      freeProductEndTime: data.freeProductEndTime || ''
    };

    const updatedProducts = [newProduct, ...products];
    this.saveProducts(updatedProducts);

    return { success: true, product: newProduct };
  },

  updateProduct(id: string, data: Partial<Product>, isDraft = false): { success: boolean; product?: Product; error?: string } {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id || p._id === id);

    if (index === -1) {
      return { success: false, error: 'Product not found.' };
    }

    if (data.slug) {
      const newSlug = slugify(data.slug);
      const duplicate = products.find((p) => (p.id !== id && p._id !== id) && p.slug.toLowerCase() === newSlug.toLowerCase());
      if (!isDraft && duplicate) {
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

    const targetStatus = isDraft ? 'draft' : data.status || (products[index].status === 'draft' ? 'active' : products[index].status);

    const updatedProduct: Product = {
      ...products[index],
      ...data,
      price,
      oldPrice,
      discountPercent,
      status: targetStatus,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    this.saveProducts(products);

    return { success: true, product: updatedProduct };
  },

  deleteProduct(id: string): { success: boolean; error?: string } {
    const products = this.getProducts();
    const exists = products.some((p) => p.id === id || p._id === id);

    if (!exists) {
      return { success: false, error: 'Product not found.' };
    }

    const updatedProducts = products.filter((p) => p.id !== id && p._id !== id);
    this.saveProducts(updatedProducts);

    return { success: true };
  },

  bulkDeleteProducts(ids: string[]): { success: boolean; count: number } {
    const products = this.getProducts();
    const idsSet = new Set(ids);
    const updatedProducts = products.filter((p) => !idsSet.has(p.id) && !idsSet.has(p._id || ''));
    const deletedCount = products.length - updatedProducts.length;
    this.saveProducts(updatedProducts);
    return { success: true, count: deletedCount };
  },

  toggleBestSeller(id: string): { success: boolean; isBestSeller?: boolean } {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id || p._id === id);
    if (index === -1) return { success: false };

    products[index].isBestSeller = !products[index].isBestSeller;
    this.saveProducts(products);
    return { success: true, isBestSeller: products[index].isBestSeller };
  },

  toggleOutOfStock(id: string): { success: boolean; isOutOfStock?: boolean } {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id || p._id === id);
    if (index === -1) return { success: false };

    products[index].isOutOfStock = !products[index].isOutOfStock;
    this.saveProducts(products);
    return { success: true, isOutOfStock: products[index].isOutOfStock };
  },

  getBestSellers(): Product[] {
    return this.getProducts()
      .filter((p) => (p.isBestSeller || p.badge === 'Bestseller') && p.status !== 'inactive' && p.status !== 'draft')
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
  },

  getNewArrivals(): Product[] {
    return this.getProducts()
      .filter((p) => (p.isNewArrival || p.badge === 'New') && p.status !== 'inactive' && p.status !== 'draft')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  getProductsByCategory(categorySlug: string): Product[] {
    const norm = categorySlug.trim().toLowerCase();
    return this.getProducts().filter(
      (p) => p.status !== 'inactive' && p.status !== 'draft' && (p.categorySlug?.toLowerCase() === norm || p.category?.toLowerCase() === norm || p.software?.toLowerCase() === norm)
    );
  }
};
