import { STORAGE_KEYS, storageService } from '../services/storageService';
import type { User } from '../types/user';
import type { Order } from '../types/order';
import { MOCK_PRODUCTS } from '../data/products';
import { CATEGORY_DEFINITIONS } from '../data/categories';

import { MOCK_REVIEWS } from '../data/reviews';
import type { Product } from '../types/product';
import type { CustomerReview } from '../types/product';

export const DEFAULT_ADMIN: User = {
  id: 'admin_1',
  name: 'Civil Digital Store Admin',
  email: 'admin@civildigitalstore.com',
  phone: '9999999999',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export const INITIAL_SAMPLE_USER: User = {
  id: 'user_1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  phone: '9876543210',
  role: 'user',
  createdAt: new Date().toISOString(),
};

export const INITIAL_SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    userId: 'user_1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul@example.com',
    customerPhone: '9876543210',
    shippingAddress: '123 Civil Layout, Bangalore, Karnataka',
    items: [
      {
        id: 'item_1',
        productId: 'autocad-2007',
        title: 'AutoCAD 2007 Complete Software & DWG Library Bundle',
        price: 499,
        quantity: 1,
        image: MOCK_PRODUCTS[0]?.images[0] || '',
        fileFormat: 'ZIP / DWG',
      },
    ],
    subtotal: 499,
    gst: 90,
    totalAmount: 589,
    status: 'Completed',
    paymentMethod: 'UPI / Direct Download',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ord_1002',
    userId: 'user_1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul@example.com',
    customerPhone: '9876543210',
    shippingAddress: '123 Civil Layout, Bangalore, Karnataka',
    items: [
      {
        id: 'item_2',
        productId: 'autodesk-revit-2014',
        title: 'Autodesk Revit 2014 BIM Family Libraries & Architecture Models',
        price: 699,
        quantity: 1,
        image: MOCK_PRODUCTS[2]?.images[0] || MOCK_PRODUCTS[0]?.images[0] || '',
        fileFormat: 'ZIP / RFA',
      },
    ],
    subtotal: 699,
    gst: 126,
    totalAmount: 825,
    status: 'Processing',
    paymentMethod: 'Credit Card',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const initializeAppData = (): void => {
  storageService.removeItem(STORAGE_KEYS.LEGACY_AUTH_TOKEN);

  // 1. Seed Users if civil_users doesn't exist
  const existingUsers = storageService.getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (!existingUsers || existingUsers.length === 0) {
    storageService.setItem<User[]>(STORAGE_KEYS.USERS, [DEFAULT_ADMIN, INITIAL_SAMPLE_USER]);
  } else {
    const sanitizedUsers = (
      existingUsers as Array<User & { password?: string }>
    ).map(({ password: _removedPassword, ...user }) => user);
    const adminExists = sanitizedUsers.some(
      (u) => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
    );
    storageService.setItem<User[]>(
      STORAGE_KEYS.USERS,
      adminExists ? sanitizedUsers : [DEFAULT_ADMIN, ...sanitizedUsers],
    );
  }

  // 2. Seed Products if civil_products doesn't exist, or migrate fields if missing
  const storedProducts = storageService.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (!storedProducts || storedProducts.length === 0) {
    storageService.setItem(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
  } else {
    // Enrich existing products in localStorage with new default fields if missing
    let updated = false;
    const enrichedProducts = storedProducts.map((p) => {
      const mockMatch = MOCK_PRODUCTS.find((m) => m.id === p.id || m.slug === p.slug);
      let changes = false;
      const copy = { ...p };

      if (copy.isBestSeller === undefined) {
        copy.isBestSeller = mockMatch ? mockMatch.isBestSeller ?? false : false;
        changes = true;
      }
      if (copy.isNewArrival === undefined) {
        copy.isNewArrival = mockMatch ? mockMatch.isNewArrival ?? false : false;
        changes = true;
      }
      if (!copy.createdAt) {
        copy.createdAt = mockMatch ? mockMatch.createdAt : new Date().toISOString();
        changes = true;
      }
      if (!copy.status) {
        copy.status = 'active';
        changes = true;
      }
      if (changes) updated = true;
      return copy;
    });

    if (updated) {
      storageService.setItem(STORAGE_KEYS.PRODUCTS, enrichedProducts);
    }
  }

  // 3. Seed Categories if civil_categories doesn't exist
  const existingCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!existingCategories) {
    storageService.setItem(STORAGE_KEYS.CATEGORIES, CATEGORY_DEFINITIONS);
  }

  // 4. Seed Orders if civil_orders doesn't exist
  const existingOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!existingOrders) {
    storageService.setItem(STORAGE_KEYS.ORDERS, INITIAL_SAMPLE_ORDERS);
  }

  // 5. Seed Reviews if civil_reviews doesn't exist
  const existingReviews = storageService.getItem<CustomerReview[]>(STORAGE_KEYS.REVIEWS, []);
  if (!existingReviews || existingReviews.length === 0) {
    storageService.setItem(STORAGE_KEYS.REVIEWS, MOCK_REVIEWS);
  }
};
