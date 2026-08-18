import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Connect to MongoDB
connectDB();

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import uploadRoutes from './routes/uploadRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import basketRoutes from './routes/basketRoutes';
import addressRoutes from './routes/addressRoutes';
import flashSaleRoutes from './routes/flashSaleRoutes';
import bannerRoutes from './routes/bannerRoutes';
import reportRoutes from './routes/reportRoutes';
import vendorRoutes from './routes/vendorRoutes';

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://192.168.1.11:3000',
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/baskets', basketRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/flashsale', flashSaleRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vendors', vendorRoutes);

import { verifyEmailConfig } from './utils/mailer';

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  verifyEmailConfig();
});
