import { Request, Response } from 'express';
import FlashSale from '../models/FlashSale';

export const getActiveFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashSale = await FlashSale.findOne({ isActive: true });
    if (!flashSale || new Date(flashSale.endTime) <= new Date()) {
      res.status(200).json({ active: false });
      return;
    }
    res.status(200).json({
      active: true,
      title: flashSale.title,
      discountPercentage: flashSale.discountPercentage,
      endTime: flashSale.endTime,
      bannerText: flashSale.bannerText
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlashSaleConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let flashSale = await FlashSale.findOne({});
    if (!flashSale) {
      flashSale = await FlashSale.create({
        title: 'Midnight Organic Flash Sale!',
        discountPercentage: 15,
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: false,
        bannerText: '⚡ FLASH SALE: Get 15% OFF on ALL Organic Products!'
      });
    }
    res.status(200).json(flashSale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveFlashSaleConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, discountPercentage, endTime, isActive, bannerText } = req.body;
    let flashSale = await FlashSale.findOne({});
    if (flashSale) {
      flashSale.title = title || flashSale.title;
      flashSale.discountPercentage = discountPercentage !== undefined ? discountPercentage : flashSale.discountPercentage;
      flashSale.endTime = endTime || flashSale.endTime;
      flashSale.isActive = isActive !== undefined ? isActive : flashSale.isActive;
      flashSale.bannerText = bannerText || flashSale.bannerText;
      await flashSale.save();
    } else {
      flashSale = await FlashSale.create({
        title,
        discountPercentage,
        endTime,
        isActive,
        bannerText
      });
    }
    res.status(200).json(flashSale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    let flashSale = await FlashSale.findOne({});
    if (!flashSale) {
      res.status(404).json({ message: 'No Flash Sale configuration found' });
      return;
    }
    flashSale.isActive = !flashSale.isActive;
    await flashSale.save();
    res.status(200).json(flashSale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
