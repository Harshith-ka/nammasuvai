import express from 'express';
import { getActiveFlashSale, getFlashSaleConfig, saveFlashSaleConfig, toggleFlashSale } from '../controllers/flashSaleController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/active', getActiveFlashSale);

router.route('/')
  .get(protect, admin, getFlashSaleConfig)
  .post(protect, admin, saveFlashSaleConfig);

router.put('/toggle', protect, admin, toggleFlashSale);

export default router;
