import express from 'express';
import { sendOtp, verifyOtp, login, signup } from '../controllers/authController';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/login', login);

export default router;
