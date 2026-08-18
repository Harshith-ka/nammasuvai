import express from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorAnalytics,
} from '../controllers/vendorController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getVendors)
  .post(protect, admin, createVendor);

router.route('/:id')
  .get(getVendorById)
  .put(protect, admin, updateVendor)
  .delete(protect, admin, deleteVendor);

router.route('/:id/analytics')
  .get(protect, admin, getVendorAnalytics);

export default router;
