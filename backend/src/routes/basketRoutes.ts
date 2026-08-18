import express from 'express';
import { getBasket, syncBasket } from '../controllers/basketController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getBasket).post(protect, syncBasket);

export default router;
