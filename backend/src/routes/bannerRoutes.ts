import express from 'express';
import { getBanner, saveBanner } from '../controllers/bannerController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getBanner);
router.post('/', protect, admin, saveBanner);

export default router;
