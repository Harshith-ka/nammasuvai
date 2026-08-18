import express from 'express';
import { createCoupon, getCoupons, validateCoupon, deleteCoupon, toggleCouponStatus } from '../controllers/couponController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.post('/validate', protect, validateCoupon);

router.route('/:id')
  .delete(protect, admin, deleteCoupon);

router.route('/:id/toggle')
  .put(protect, admin, toggleCouponStatus);

export default router;
