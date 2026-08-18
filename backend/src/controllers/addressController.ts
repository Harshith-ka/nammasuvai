import { Request, Response } from 'express';
import Address from '../models/Address';

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({ user: (req as any).user._id });
    res.json(addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAddress = async (req: Request, res: Response): Promise<void> => {
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
      country: country || 'India',
      isDefault: isDefault || false
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
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: (req as any).user._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id as string, user: (req as any).user._id },
      req.body,
      { new: true }
    );

    if (address) {
      res.json(address);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id as string, user: (req as any).user._id });

    if (address) {
      res.json({ message: 'Address removed' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
