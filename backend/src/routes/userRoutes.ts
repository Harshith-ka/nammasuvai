import express from 'express';
import { getUserProfile, updateUserProfile, getAddresses, addAddress, updateAddress, deleteAddress, getWishlist, addToWishlist, removeFromWishlist, getAllUsers } from '../controllers/userController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').get(protect, admin, getAllUsers);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);
router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);
router.route('/wishlist/:productId')
  .delete(protect, removeFromWishlist);

export default router;
