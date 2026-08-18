import express from 'express';
import { addOrderItems, createPaytmOrder, verifyPaytmPayment, getMyOrders, getAllOrders, updateOrderStatus, syncOrderWithZoho, syncAllOrdersWithZoho } from '../controllers/orderController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').post(protect, addOrderItems);
router.route('/all').get(protect, admin, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/zoho-sync-all').post(protect, admin, syncAllOrdersWithZoho);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/zoho-sync').post(protect, admin, syncOrderWithZoho);
router.route('/:id/pay').post(protect, createPaytmOrder);
router.route('/:id/verify').post(protect, verifyPaytmPayment);
router.route('/:id/paytm-pay').post(protect, createPaytmOrder);
router.route('/:id/paytm-verify').post(protect, verifyPaytmPayment);

export default router;
