import express from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/addressController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getAddresses)
  .post(protect, createAddress);

router.route('/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;
