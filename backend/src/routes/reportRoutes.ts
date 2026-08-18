import express from 'express';
import {
  generateOPL,
  generateOPLbyProductType,
  AggregateSuppliers,
  GenerateOrderList,
  GenerateOrderPrefereneces,
  PrevoiusSalebyProduct,
  generateDaysSummary
} from '../controllers/reportController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/opl', protect, admin, generateOPL);
router.get('/opl-by-type', protect, admin, generateOPLbyProductType);
router.get('/suppliers', protect, admin, AggregateSuppliers);
router.get('/orders', protect, admin, GenerateOrderList);
router.get('/preferences', protect, admin, GenerateOrderPrefereneces);
router.get('/product-sales', protect, admin, PrevoiusSalebyProduct);
router.get('/days-summary', protect, admin, generateDaysSummary);

export default router;
