import { STORAGE_KEYS, storageService } from './storageService';
import type { CustomerReview } from '../types/product';
import { MOCK_REVIEWS } from '../data/reviews';
import { generateId } from '../utils/generateId';

export const reviewService = {
  getReviews(): CustomerReview[] {
    return storageService.getItem<CustomerReview[]>(STORAGE_KEYS.REVIEWS, MOCK_REVIEWS);
  },

  saveReviews(reviews: CustomerReview[]): void {
    storageService.setItem<CustomerReview[]>(STORAGE_KEYS.REVIEWS, reviews);
  },

  getRecentReviews(limit: number = 6): CustomerReview[] {
    const reviews = this.getReviews();
    return [...reviews]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  getReviewsByProduct(productId: string): CustomerReview[] {
    const reviews = this.getReviews();
    return reviews.filter((r) => r.productId === productId);
  },

  addReview(reviewData: Partial<CustomerReview> & { userName: string; comment: string; rating: number; productId: string; productName: string }): { success: boolean; review?: CustomerReview; error?: string } {
    const reviews = this.getReviews();
    const newReview: CustomerReview = {
      id: generateId('review'),
      userId: reviewData.userId || 'user_guest',
      userName: reviewData.userName,
      productId: reviewData.productId,
      productName: reviewData.productName,
      rating: Number(reviewData.rating) || 5,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      avatar: reviewData.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };

    const updated = [newReview, ...reviews];
    this.saveReviews(updated);
    return { success: true, review: newReview };
  },
};
