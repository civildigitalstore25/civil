import type { Request, Response } from 'express';
import Coupon from '../models/Coupon.js';

export const getCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    // Auto-update status for expired or limit-reached coupons if active
    const now = new Date();
    const updatePromises = coupons.map(async (coupon) => {
      if (
        coupon.status === 'active' &&
        (coupon.usageCount >= coupon.usageLimit || new Date(coupon.validTo) < now)
      ) {
        coupon.status = 'inactive';
        await coupon.save();
      }
      return coupon;
    });

    const updatedCoupons = await Promise.all(updatePromises);
    res.json(updatedCoupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error });
  }
};

export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupon', error });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      validFrom,
      validTo,
      usageLimit,
      applicableProducts,
      applicableCategories,
      status,
    } = req.body;

    if (!code || !name || !discountType || discountValue === undefined || !validFrom || !validTo) {
      res.status(400).json({ message: 'Missing required coupon fields' });
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    if (!cleanCode || /\s/.test(cleanCode)) {
      res.status(400).json({ message: 'Coupon code cannot contain spaces' });
      return;
    }

    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      res.status(400).json({ message: `Coupon code "${cleanCode}" already exists.` });
      return;
    }

    const val = Number(discountValue);
    if (isNaN(val) || val < 0) {
      res.status(400).json({ message: 'Discount value must be a non-negative number' });
      return;
    }

    if (discountType === 'percentage' && (val < 1 || val > 100)) {
      res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
      return;
    }

    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);

    if (toDate < fromDate) {
      res.status(400).json({ message: 'Valid To date cannot be earlier than Valid From date' });
      return;
    }

    const limit = Number(usageLimit) || 1;
    if (limit <= 0) {
      res.status(400).json({ message: 'Usage limit must be greater than 0' });
      return;
    }

    const newCoupon = new Coupon({
      code: cleanCode,
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      discountType,
      discountValue: val,
      validFrom: fromDate,
      validTo: toDate,
      usageLimit: limit,
      usageCount: 0,
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      status: status || 'active',
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      validFrom,
      validTo,
      usageLimit,
      applicableProducts,
      applicableCategories,
      status,
    } = req.body;

    if (code) {
      const cleanCode = String(code).trim().toUpperCase();
      if (!cleanCode || /\s/.test(cleanCode)) {
        res.status(400).json({ message: 'Coupon code cannot contain spaces' });
        return;
      }
      const existing = await Coupon.findOne({ code: cleanCode, _id: { $ne: id as any } });
      if (existing) {
        res.status(400).json({ message: `Coupon code "${cleanCode}" is already in use.` });
        return;
      }
      coupon.code = cleanCode;
    }

    if (name) coupon.name = String(name).trim();
    if (description !== undefined) coupon.description = String(description).trim();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) {
      const val = Number(discountValue);
      if (isNaN(val) || val < 0) {
        res.status(400).json({ message: 'Discount value must be a non-negative number' });
        return;
      }
      if (discountType === 'percentage' && (val < 1 || val > 100)) {
        res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
        return;
      }
      coupon.discountValue = val;
    }

    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validTo) coupon.validTo = new Date(validTo);

    if (coupon.validTo < coupon.validFrom) {
      res.status(400).json({ message: 'Valid To date cannot be earlier than Valid From date' });
      return;
    }

    if (usageLimit !== undefined) {
      const limit = Number(usageLimit);
      if (limit <= 0) {
        res.status(400).json({ message: 'Usage limit must be greater than 0' });
        return;
      }
      coupon.usageLimit = limit;
    }

    if (applicableProducts !== undefined) {
      coupon.applicableProducts = Array.isArray(applicableProducts) ? applicableProducts : [];
    }

    if (applicableCategories !== undefined) {
      coupon.applicableCategories = Array.isArray(applicableCategories) ? applicableCategories : [];
    }

    if (status) coupon.status = status;

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon', error });
  }
};

export const toggleCouponStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon status', error });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, productIds, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ valid: false, message: 'Coupon code is required' });
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      res.status(404).json({ valid: false, message: 'Invalid coupon code' });
      return;
    }

    if (coupon.status !== 'active') {
      res.status(400).json({ valid: false, message: 'This coupon is currently inactive' });
      return;
    }

    const now = new Date();
    if (now < new Date(coupon.validFrom)) {
      res.status(400).json({ valid: false, message: 'This coupon is not yet active' });
      return;
    }

    if (now > new Date(coupon.validTo)) {
      res.status(400).json({ valid: false, message: 'This coupon has expired' });
      return;
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({ valid: false, message: 'Coupon usage limit has been reached' });
      return;
    }

    // Check product targeting if applicable
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const itemsArr = Array.isArray(productIds) ? productIds : [];
      const isEligible = itemsArr.some((id: string) => coupon.applicableProducts.includes(id));
      if (!isEligible) {
        res.status(400).json({
          valid: false,
          message: 'This coupon is not applicable to the items in your cart',
        });
        return;
      }
    }

    let discountAmount = 0;
    const cartTotal = Number(subtotal) || 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(cartTotal, coupon.discountValue);
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
      message: `Coupon "${coupon.code}" applied successfully!`,
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Error validating coupon', error });
  }
};
