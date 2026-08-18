import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, type, discountValue, expiryDate, usageLimit } = req.body;
    
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      res.status(400).json({ message: 'Coupon code already exists' });
      return;
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      discountValue,
      expiryDate,
      usageLimit
    });

    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    if (!coupon.isActive) {
      res.status(400).json({ message: 'Coupon is no longer active' });
      return;
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400).json({ message: 'Coupon has expired' });
      return;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ message: 'Coupon usage limit reached' });
      return;
    }

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCouponStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
