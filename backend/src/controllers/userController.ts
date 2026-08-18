import { Request, Response } from 'express';
import User from '../models/User';
import Address from '../models/Address';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({ user: (req as any).user._id });
    res.json(addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phone, streetAddress, city, state, postalCode, country, isDefault } = req.body;
    
    if (isDefault) {
      await Address.updateMany({ user: (req as any).user._id }, { isDefault: false });
    }

    const address = new Address({
      user: (req as any).user._id,
      fullName,
      phone,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      isDefault
    });

    const createdAddress = await address.save();
    res.status(201).json(createdAddress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, phone, streetAddress, city, state, postalCode, country, isDefault } = req.body;

    const address = await Address.findById(id);

    if (address && address.user.toString() === (req as any).user._id.toString()) {
      if (isDefault) {
        await Address.updateMany({ user: (req as any).user._id }, { isDefault: false });
      }

      address.fullName = fullName || address.fullName;
      address.phone = phone || address.phone;
      address.streetAddress = streetAddress || address.streetAddress;
      address.city = city || address.city;
      address.state = state || address.state;
      address.postalCode = postalCode || address.postalCode;
      address.country = country || address.country;
      address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

      const updatedAddress = await address.save();
      res.json(updatedAddress);
    } else {
      res.status(404).json({ message: 'Address not found or not authorized' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await Address.findById(id);

    if (address && address.user.toString() === (req as any).user._id.toString()) {
      await address.deleteOne();
      res.json({ message: 'Address removed' });
    } else {
      res.status(404).json({ message: 'Address not found or not authorized' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).populate('wishlist');
    res.json(user?.wishlist || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    const productId = req.body.productId;

    const exists = user?.wishlist?.some(id => id.toString() === productId);
    if (user && !exists) {
      user.wishlist = user.wishlist || [];
      user.wishlist.push(productId);
      await user.save();
      res.json(user.wishlist);
    } else {
      res.status(400).json({ message: 'Product already in wishlist' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    const productId = req.params.productId;

    if (user) {
      user.wishlist = (user.wishlist || []).filter(id => id.toString() !== productId);
      await user.save();
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

