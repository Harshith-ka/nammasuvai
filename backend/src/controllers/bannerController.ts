import { Request, Response } from 'express';
import Banner from '../models/Banner';

export const getBanner = async (req: Request, res: Response) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({});
    }
    res.status(200).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch banner" });
  }
};

export const saveBanner = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, imageUrl, badgeText, isActive } = req.body;
    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({ title, subtitle, imageUrl, badgeText, isActive });
    } else {
      if (title !== undefined) banner.title = title;
      if (subtitle !== undefined) banner.subtitle = subtitle;
      if (imageUrl !== undefined) banner.imageUrl = imageUrl;
      if (badgeText !== undefined) banner.badgeText = badgeText;
      if (isActive !== undefined) banner.isActive = isActive;
      await banner.save();
    }
    res.status(200).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to save banner" });
  }
};
