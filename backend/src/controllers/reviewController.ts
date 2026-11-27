import type { Response } from 'express';
import mongoose, { type Types } from 'mongoose';
import Review, { REVIEW_LIMITS, type IReview, type ReviewStatus } from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User, { type IUser } from '../models/User.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

/* ------------------------------------------------------------------ helpers */

const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];
const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  highest: { rating: -1, createdAt: -1 },
  lowest: { rating: 1, createdAt: -1 },
};

const isAdminUser = (user?: IUser | null) => user?.role === 'admin' || user?.role === 'superadmin';

const queryString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const queryInt = (value: unknown, fallback: number, min: number, max: number): number => {
  const parsed = Number.parseInt(queryString(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const paramId = (req: AuthRequest, key: string): string => String(req.params[key] ?? '').trim();

const isObjectId = (value: string): boolean => mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(value);

/** Plain text only: strip control characters (keep new lines / tabs), normalise line endings, trim. */
const cleanText = (value: unknown): string =>
  (typeof value === 'string' || typeof value === 'number' ? String(value) : '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const cleanName = (value: unknown): string => cleanText(value).replace(/\s+/g, ' ');

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseRating = (value: unknown): number | null => {
  const rating = typeof value === 'number' ? value : Number(queryString(value));
  return Number.isInteger(rating) && rating >= REVIEW_LIMITS.ratingMin && rating <= REVIEW_LIMITS.ratingMax
    ? rating
    : null;
};

/** Admins may set a custom review date (YYYY-MM-DD or ISO). Rejects invalid / far-future values. */
const parseAdminCreatedAt = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const max = Date.now() + 24 * 60 * 60 * 1000;
  if (date.getTime() > max) return null;
  return date;
};

const persistAdminCreatedAt = async (reviewId: Types.ObjectId, body: Record<string, unknown>) => {
  const createdAt = parseAdminCreatedAt(body.createdAt);
  if (!createdAt) return null;
  await Review.updateOne({ _id: reviewId }, { $set: { createdAt } });
  return createdAt;
};

interface ReviewInput {
  rating: number;
  title: string;
  comment: string;
}

type ValidationResult = { ok: true; value: ReviewInput } | { ok: false; message: string; field: string };

const validateReviewInput = (body: Record<string, unknown>): ValidationResult => {
  const rating = parseRating(body.rating);
  if (rating === null) {
    return { ok: false, field: 'rating', message: 'Please select a star rating between 1 and 5.' };
  }
  const title = cleanName(body.title);
  if (title.length > REVIEW_LIMITS.titleMax) {
    return { ok: false, field: 'title', message: `Review title must be ${REVIEW_LIMITS.titleMax} characters or fewer.` };
  }
  const comment = cleanText(body.comment);
  if (comment.length < REVIEW_LIMITS.commentMin) {
    return {
      ok: false,
      field: 'comment',
      message: `Please write at least ${REVIEW_LIMITS.commentMin} characters about your experience.`,
    };
  }
  if (comment.length > REVIEW_LIMITS.commentMax) {
    return { ok: false, field: 'comment', message: `Review must be ${REVIEW_LIMITS.commentMax} characters or fewer.` };
  }
  return { ok: true, value: { rating, title, comment } };
};

const validateDisplayName = (value: unknown): { ok: true; name: string } | { ok: false; message: string } => {
  const name = cleanName(value);
  if (name.length < REVIEW_LIMITS.nameMin) {
    return { ok: false, message: `Reviewer name must be at least ${REVIEW_LIMITS.nameMin} characters.` };
  }
  if (name.length > REVIEW_LIMITS.nameMax) {
    return { ok: false, message: `Reviewer name must be ${REVIEW_LIMITS.nameMax} characters or fewer.` };
  }
  return { ok: true, name };
};

const customerName = (user: IUser): string => {
  const name = cleanName(user.name).slice(0, REVIEW_LIMITS.nameMax);
  return name || 'Customer';
};

/**
 * Verified purchase = the customer has a paid, non-cancelled order (matched by account id or email,
 * the same way "My Orders" matches) that contains this product. Returns the merchant order id or ''.
 */
const findPurchaseOrderId = async (user: IUser, productId: string): Promise<string> => {
  const owners: Record<string, string>[] = [{ userId: String(user._id) }];
  const email = String(user.email || '').trim().toLowerCase();
  if (email) owners.push({ customerEmail: email });
  const order = await Order.findOne({
    $or: owners,
    paymentStatus: 'Paid',
    status: { $ne: 'Cancelled' },
    'items.productId': productId,
  })
    .sort({ createdAt: -1 })
    .select('orderId')
    .lean();
  return order?.orderId ? String(order.orderId) : '';
};

type RatingSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
};

const emptySummary = (): RatingSummary => ({
  averageRating: 0,
  totalReviews: 0,
  distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
});

const buildSummary = async (productId: Types.ObjectId): Promise<RatingSummary> => {
  const rows = await Review.aggregate<{ _id: number; count: number }>([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  const summary = emptySummary();
  let sum = 0;
  for (const row of rows) {
    const key = String(row._id) as keyof RatingSummary['distribution'];
    if (key in summary.distribution) {
      summary.distribution[key] = row.count;
      summary.totalReviews += row.count;
      sum += row._id * row.count;
    }
  }
  summary.averageRating = summary.totalReviews ? Math.round((sum / summary.totalReviews) * 10) / 10 : 0;
  return summary;
};

/** Keep Product.rating / Product.reviewCount (used by product cards & filters) in sync with approved reviews. */
const syncProductRating = async (productId: Types.ObjectId): Promise<void> => {
  try {
    const summary = await buildSummary(productId);
    await Product.updateOne(
      { _id: productId },
      { $set: { rating: summary.averageRating, reviewCount: summary.totalReviews } }
    );
  } catch (error) {
    console.error('Failed to sync product rating:', error);
  }
};

const publicReview = (review: IReview) => ({
  id: String(review._id),
  displayName: review.displayName,
  rating: review.rating,
  title: review.title || '',
  comment: review.comment,
  verifiedPurchase: Boolean(review.verifiedPurchase),
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

const ownReview = (review: IReview) => ({
  ...publicReview(review),
  status: review.status,
  rejectionReason: review.status === 'rejected' ? review.rejectionReason || '' : '',
});

const refId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'object' && value !== null && '_id' in value) return String((value as { _id: unknown })._id);
  return String(value);
};

const adminReview = (review: IReview) => {
  const product = review.product as unknown as { _id?: unknown; name?: string; slug?: string } | null;
  const user = review.user as unknown as { _id?: unknown; name?: string; email?: string } | null;
  return {
    ...ownReview(review),
    rejectionReason: review.rejectionReason || '',
    isAdminCreated: Boolean(review.isAdminCreated),
    orderRef: review.orderRef || '',
    approvedAt: review.approvedAt,
    product: {
      id: refId(review.product),
      name: product && typeof product === 'object' && 'name' in product ? product.name || '' : '',
      slug: product && typeof product === 'object' && 'slug' in product ? product.slug || '' : '',
    },
    user: user && typeof user === 'object' && 'email' in user
      ? { id: refId(user), name: user.name || '', email: user.email || '' }
      : null,
  };
};

const sendError = (res: Response, status: number, message: string, field?: string) => {
  res.status(status).json({ success: false, message, ...(field ? { field } : {}) });
};

const handleUnexpected = (res: Response, error: unknown, fallback: string) => {
  const err = error as { code?: number; name?: string; message?: string };
  if (err?.code === 11000) {
    sendError(res, 409, 'You have already reviewed this product. Refresh the page to edit your review.');
    return;
  }
  if (err?.name === 'ValidationError') {
    sendError(res, 400, err.message || 'Review data is invalid.');
    return;
  }
  console.error(fallback, error);
  sendError(res, 500, fallback);
};

const loadProduct = async (productId: string) => {
  if (!isObjectId(productId)) return null;
  return Product.findById(productId).select('_id name slug status');
};

/* ------------------------------------------------------------ public routes */

/** GET /api/reviews/product/:productId - approved reviews + rating summary (public). */
export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = paramId(req, 'productId');
    if (!isObjectId(productId)) return sendError(res, 400, 'Invalid product id.');
    const product = await loadProduct(productId);
    if (!product) return sendError(res, 404, 'Product not found.');

    const page = queryInt(req.query.page, 1, 1, 10_000);
    const limit = queryInt(req.query.limit, 5, 1, 50);
    const sort = SORTS[queryString(req.query.sort)] ?? SORTS.newest!;
    const ratingFilter = parseRating(req.query.rating);

    const filter: Record<string, unknown> = { product: product._id, status: 'approved' };
    if (ratingFilter !== null) filter.rating = ratingFilter;

    const [reviews, filteredTotal, summary] = await Promise.all([
      Review.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Review.countDocuments(filter),
      buildSummary(product._id as Types.ObjectId),
    ]);

    res.json({
      success: true,
      reviews: isAdminUser(req.user)
        ? reviews.map((review) => ({ ...publicReview(review), isAdminCreated: Boolean(review.isAdminCreated) }))
        : reviews.map(publicReview),
      summary,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        pages: Math.max(1, Math.ceil(filteredTotal / limit)),
        hasMore: page * limit < filteredTotal,
      },
    });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to load reviews right now.');
  }
};

/** GET /api/reviews/recent - latest approved reviews for the home page (public). */
export const getRecentReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = queryInt(req.query.limit, 6, 1, 20);
    const reviews = await Review.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(limit * 3)
      .populate('product', 'name slug status');
    const visible = reviews
      .filter((review) => {
        const product = review.product as unknown as { status?: string } | null;
        return product && typeof product === 'object' && product.status === 'active';
      })
      .slice(0, limit)
      .map((review) => {
        const product = review.product as unknown as { name?: string; slug?: string };
        return { ...publicReview(review), product: { name: product.name || '', slug: product.slug || '' } };
      });
    res.json({ success: true, reviews: visible });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to load reviews right now.');
  }
};

/* ------------------------------------------------------- customer routes */

/** GET /api/reviews/product/:productId/mine - the signed-in customer's own review (any status). */
export const getMyProductReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Please log in to continue.');
    const productId = paramId(req, 'productId');
    if (!isObjectId(productId)) return sendError(res, 400, 'Invalid product id.');
    const product = await loadProduct(productId);
    if (!product) return sendError(res, 404, 'Product not found.');

    const isAdmin = isAdminUser(user);
    const [review, orderId] = await Promise.all([
      isAdmin ? Promise.resolve(null) : Review.findOne({ product: product._id, user: user._id }),
      isAdmin ? Promise.resolve('') : findPurchaseOrderId(user, productId),
    ]);

    res.json({
      success: true,
      review: review ? ownReview(review) : null,
      hasPurchased: Boolean(orderId),
      isAdmin,
    });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to load your review right now.');
  }
};

/**
 * GET /api/reviews/mine?productIds=a,b,c - the signed-in user's own reviews for several products at once
 * (used by the order details page), plus which of those products still exist and accept reviews.
 */
export const getMyReviewsForProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Please log in to continue.');
    const ids = [
      ...new Set(
        queryString(req.query.productIds)
          .split(',')
          .map((id) => id.trim())
          .filter(isObjectId),
      ),
    ].slice(0, 50);
    if (!ids.length) {
      res.json({ success: true, reviews: {}, products: {} });
      return;
    }

    const [reviews, products] = await Promise.all([
      Review.find({ user: user._id, product: { $in: ids } }),
      Product.find({ _id: { $in: ids } }).select('_id slug status').lean(),
    ]);

    const reviewMap: Record<string, ReturnType<typeof ownReview>> = {};
    for (const review of reviews) reviewMap[String(review.product)] = ownReview(review);
    const productMap: Record<string, { slug: string; reviewable: boolean }> = {};
    for (const product of products) {
      productMap[String(product._id)] = { slug: String(product.slug || ''), reviewable: product.status === 'active' };
    }

    res.json({ success: true, reviews: reviewMap, products: productMap });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to load your reviews right now.');
  }
};

/** Apply a customer's edit to their own review. Any customer edit goes back to admin approval. */
const applyCustomerEdit = async (review: IReview, user: IUser, input: ReviewInput, productId: string) => {
  const unchanged =
    review.rating === input.rating && (review.title || '') === input.title && review.comment === input.comment;
  if (unchanged && review.status !== 'rejected') {
    return { changed: false as const, wasApproved: review.status === 'approved' };
  }
  const wasApproved = review.status === 'approved';
  const orderId = await findPurchaseOrderId(user, productId);
  review.rating = input.rating;
  review.title = input.title;
  review.comment = input.comment;
  review.displayName = customerName(user);
  review.status = 'pending';
  review.rejectionReason = '';
  review.approvedAt = null;
  review.approvedBy = null;
  review.verifiedPurchase = Boolean(orderId);
  review.orderRef = orderId;
  await review.save();
  return { changed: true as const, wasApproved };
};

/**
 * POST /api/reviews/product/:productId
 * Customers: create their review (or update it if one already exists) - always pending approval.
 * Admins: publish a review under any display name - approved immediately.
 */
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Please log in to write a review.');
    const productId = paramId(req, 'productId');
    if (!isObjectId(productId)) return sendError(res, 400, 'Invalid product id.');
    const product = await loadProduct(productId);
    if (!product) return sendError(res, 404, 'Product not found.');

    const body = (req.body ?? {}) as Record<string, unknown>;
    const parsed = validateReviewInput(body);
    if (!parsed.ok) return sendError(res, 400, parsed.message, parsed.field);

    // asCustomer: an admin reviewing a product from their own order is treated like any customer.
    if (isAdminUser(user) && body.asCustomer !== true) {
      const nameCheck = validateDisplayName(body.displayName ?? user.name);
      if (!nameCheck.ok) return sendError(res, 400, nameCheck.message, 'displayName');
      const review = await Review.create({
        product: product._id,
        user: null,
        createdBy: user._id,
        displayName: nameCheck.name,
        ...parsed.value,
        status: 'approved',
        isAdminCreated: true,
        verifiedPurchase: false,
        approvedAt: new Date(),
        approvedBy: user._id,
      });
      const customDate = await persistAdminCreatedAt(review._id as Types.ObjectId, body);
      if (customDate) review.createdAt = customDate;
      await syncProductRating(product._id as Types.ObjectId);
      res.status(201).json({ success: true, message: 'Review published successfully.', review: adminReview(review) });
      return;
    }

    if (product.status !== 'active') {
      return sendError(res, 400, 'Reviews are not available for this product right now.');
    }

    // displayName from customers is ignored on purpose - only admins may choose a custom name.
    const existing = await Review.findOne({ product: product._id, user: user._id });
    if (existing) {
      const result = await applyCustomerEdit(existing, user, parsed.value, productId);
      if (result.wasApproved && result.changed) await syncProductRating(product._id as Types.ObjectId);
      res.json({
        success: true,
        updated: true,
        message: result.changed
          ? 'Your review has been updated and is pending admin approval.'
          : 'No changes to save.',
        review: ownReview(existing),
      });
      return;
    }

    const orderId = await findPurchaseOrderId(user, productId);
    const review = await Review.create({
      product: product._id,
      user: user._id,
      createdBy: null,
      displayName: customerName(user),
      ...parsed.value,
      status: 'pending',
      isAdminCreated: false,
      verifiedPurchase: Boolean(orderId),
      orderRef: orderId,
    });
    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending admin approval.',
      review: ownReview(review),
    });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to submit your review right now. Please try again.');
  }
};

/** PUT /api/reviews/:reviewId - owner edits their review (back to pending); admins edit any review. */
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Please log in to continue.');
    const reviewId = paramId(req, 'reviewId');
    if (!isObjectId(reviewId)) return sendError(res, 400, 'Invalid review id.');
    const review = await Review.findById(reviewId);
    if (!review) return sendError(res, 404, 'This review no longer exists. It may have been deleted.');

    const admin = isAdminUser(user);
    const isOwner = Boolean(review.user && review.user.equals(user._id as Types.ObjectId));
    if (!admin && !isOwner) return sendError(res, 403, 'You can only edit your own review.');

    const body = (req.body ?? {}) as Record<string, unknown>;
    const parsed = validateReviewInput(body);
    if (!parsed.ok) return sendError(res, 400, parsed.message, parsed.field);

    // Admins editing the review they wrote from their own order (asCustomer) go through the customer flow too.
    if (!admin || (isOwner && body.asCustomer === true)) {
      const result = await applyCustomerEdit(review, user, parsed.value, String(review.product));
      if (result.wasApproved && result.changed) await syncProductRating(review.product);
      res.json({
        success: true,
        message: result.changed
          ? 'Your review has been updated and is pending admin approval.'
          : 'No changes to save.',
        review: ownReview(review),
      });
      return;
    }

    // Admin edit: content changes keep the current status. Custom names only apply to admin-created reviews.
    if (review.isAdminCreated && body.displayName !== undefined) {
      const nameCheck = validateDisplayName(body.displayName);
      if (!nameCheck.ok) return sendError(res, 400, nameCheck.message, 'displayName');
      review.displayName = nameCheck.name;
    }
    review.rating = parsed.value.rating;
    review.title = parsed.value.title;
    review.comment = parsed.value.comment;
    await review.save();
    const customDate = await persistAdminCreatedAt(review._id as Types.ObjectId, body);
    if (customDate) review.createdAt = customDate;
    await syncProductRating(review.product);
    await review.populate([
      { path: 'product', select: 'name slug' },
      { path: 'user', select: 'name email' },
    ]);
    res.json({ success: true, message: 'Review updated successfully.', review: adminReview(review) });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to update the review right now. Please try again.');
  }
};

/** DELETE /api/reviews/:reviewId - owner deletes their review; admins delete any review. */
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Please log in to continue.');
    const reviewId = paramId(req, 'reviewId');
    if (!isObjectId(reviewId)) return sendError(res, 400, 'Invalid review id.');
    const review = await Review.findById(reviewId);
    if (!review) return sendError(res, 404, 'This review no longer exists. It may have already been deleted.');

    const admin = isAdminUser(user);
    const isOwner = Boolean(review.user && review.user.equals(user._id as Types.ObjectId));
    if (!admin && !isOwner) return sendError(res, 403, 'You can only delete your own review.');

    const productId = review.product;
    await review.deleteOne();
    await syncProductRating(productId);
    res.json({ success: true, message: isOwner ? 'Your review has been deleted.' : 'Review deleted successfully.' });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to delete the review right now. Please try again.');
  }
};

/* ---------------------------------------------------------------- admin */

/** GET /api/reviews/admin - list reviews with filters, search and per-status counts. */
export const getAdminReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = queryInt(req.query.page, 1, 1, 10_000);
    const limit = queryInt(req.query.limit, 20, 1, 100);
    const status = queryString(req.query.status);
    const productId = queryString(req.query.product);
    const search = queryString(req.query.search).slice(0, 100);
    const rating = parseRating(req.query.rating);
    const source = queryString(req.query.source);

    const base: Record<string, unknown> = {};
    if (productId) {
      if (!isObjectId(productId)) return sendError(res, 400, 'Invalid product filter.');
      base.product = new mongoose.Types.ObjectId(productId);
    }
    if (rating !== null) base.rating = rating;
    if (source && source !== 'all' && source !== 'admin' && source !== 'customer') {
      return sendError(res, 400, 'Invalid source filter.');
    }
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      const [productIds, userIds] = await Promise.all([
        Product.find({ name: rx }).select('_id').limit(200).lean(),
        User.find({ $or: [{ name: rx }, { email: rx }] }).select('_id').limit(200).lean(),
      ]);
      base.$or = [
        { displayName: rx },
        { title: rx },
        { comment: rx },
        { product: { $in: productIds.map((p) => p._id) } },
        { user: { $in: userIds.map((u) => u._id) } },
      ];
    }

    // Counts per source (customer / admin) ignore the source filter; everything else reflects it.
    const sourceBase: Record<string, unknown> = { ...base };
    if (source === 'admin') base.isAdminCreated = true;
    if (source === 'customer') base.isAdminCreated = false;

    const filter: Record<string, unknown> = { ...base };
    if (status && status !== 'all') {
      if (!REVIEW_STATUSES.includes(status as ReviewStatus)) return sendError(res, 400, 'Invalid status filter.');
      filter.status = status;
    }

    const [reviews, total, countRows, sourceRows] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('product', 'name slug')
        .populate('user', 'name email'),
      Review.countDocuments(filter),
      Review.aggregate<{ _id: ReviewStatus; count: number }>([
        { $match: base },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Review.aggregate<{ _id: boolean; count: number; pending: number }>([
        { $match: sourceBase },
        {
          $group: {
            _id: { $eq: ['$isAdminCreated', true] },
            count: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const sourceCounts = { customer: 0, admin: 0, customerPending: 0 };
    for (const row of sourceRows) {
      if (row._id) sourceCounts.admin += row.count;
      else {
        sourceCounts.customer += row.count;
        sourceCounts.customerPending += row.pending;
      }
    }

    const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };
    for (const row of countRows) {
      if (row._id in counts) {
        counts[row._id] = row.count;
        counts.all += row.count;
      }
    }

    res.json({
      success: true,
      reviews: reviews.map(adminReview),
      counts,
      sourceCounts,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)), hasMore: page * limit < total },
    });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to load reviews right now.');
  }
};

/** GET /api/reviews/admin/pending-count - for the admin sidebar badge. */
export const getPendingReviewCount = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Review.countDocuments({ status: 'pending' });
    res.json({ success: true, count });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to load the pending review count.');
  }
};

/** POST /api/reviews/admin - admin creates a review for any product under any name (auto-approved). */
export const adminCreateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Please log in to continue.');
    const body = (req.body ?? {}) as Record<string, unknown>;
    const productId = cleanText(body.productId);
    if (!productId) return sendError(res, 400, 'Please select a product.', 'productId');
    const product = await loadProduct(productId);
    if (!product) return sendError(res, 404, 'Selected product was not found.', 'productId');

    const nameCheck = validateDisplayName(body.displayName);
    if (!nameCheck.ok) return sendError(res, 400, nameCheck.message, 'displayName');
    const parsed = validateReviewInput(body);
    if (!parsed.ok) return sendError(res, 400, parsed.message, parsed.field);

    const review = await Review.create({
      product: product._id,
      user: null,
      createdBy: user._id,
      displayName: nameCheck.name,
      ...parsed.value,
      status: 'approved',
      isAdminCreated: true,
      verifiedPurchase: false,
      approvedAt: new Date(),
      approvedBy: user._id,
    });
    const customDate = await persistAdminCreatedAt(review._id as Types.ObjectId, body);
    if (customDate) review.createdAt = customDate;
    await syncProductRating(product._id as Types.ObjectId);
    await review.populate([
      { path: 'product', select: 'name slug' },
      { path: 'user', select: 'name email' },
    ]);
    res.status(201).json({ success: true, message: 'Review published successfully.', review: adminReview(review) });
  } catch (error) {
    handleUnexpected(res, error, 'Unable to create the review right now. Please try again.');
  }
};

const setStatus = async (req: AuthRequest, res: Response, next: 'approved' | 'rejected'): Promise<void> => {
  const user = req.user;
  if (!user) return sendError(res, 401, 'Please log in to continue.');
  const reviewId = paramId(req, 'reviewId');
  if (!isObjectId(reviewId)) return sendError(res, 400, 'Invalid review id.');
  const review = await Review.findById(reviewId);
  if (!review) return sendError(res, 404, 'This review no longer exists. It may have been deleted.');

  if (next === 'approved') {
    if (review.status === 'approved') return sendError(res, 409, 'This review is already approved.');
    review.status = 'approved';
    review.rejectionReason = '';
    review.approvedAt = new Date();
    review.approvedBy = user._id as Types.ObjectId;
    // Refresh the verified badge in case the customer purchased after writing the review.
    // Best effort: a failed lookup must never block the approval itself.
    if (review.user && !review.isAdminCreated) {
      try {
        const owner = await User.findById(review.user);
        if (owner) {
          const orderId = await findPurchaseOrderId(owner, String(review.product));
          review.verifiedPurchase = Boolean(orderId);
          review.orderRef = orderId;
        }
      } catch (error) {
        console.error('Verified-purchase refresh failed during approval:', error);
      }
    }
  } else {
    if (review.status === 'rejected') return sendError(res, 409, 'This review is already rejected.');
    const reason = cleanText((req.body as Record<string, unknown> | undefined)?.reason);
    if (reason.length > REVIEW_LIMITS.rejectionReasonMax) {
      return sendError(res, 400, `Rejection reason must be ${REVIEW_LIMITS.rejectionReasonMax} characters or fewer.`, 'reason');
    }
    review.status = 'rejected';
    review.rejectionReason = reason;
    review.approvedAt = null;
    review.approvedBy = null;
  }
  await review.save();
  await syncProductRating(review.product);
  await review.populate([
    { path: 'product', select: 'name slug' },
    { path: 'user', select: 'name email' },
  ]);
  res.json({
    success: true,
    message: next === 'approved' ? 'Review approved and now visible on the product page.' : 'Review rejected.',
    review: adminReview(review),
  });
};

/** PATCH /api/reviews/admin/:reviewId/approve */
export const approveReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await setStatus(req, res, 'approved');
  } catch (error) {
    handleUnexpected(res, error, 'Unable to approve the review right now.');
  }
};

/** PATCH /api/reviews/admin/:reviewId/reject  body: { reason?: string } */
export const rejectReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await setStatus(req, res, 'rejected');
  } catch (error) {
    handleUnexpected(res, error, 'Unable to reject the review right now.');
  }
};
