import { Request, Response } from 'express';
import Basket from '../models/Basket';

export const getBasket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    let basket = await Basket.findOne({ user: userId }).populate('items.product');
    
    if (!basket) {
      basket = await Basket.create({ user: userId, items: [] });
    }
    
    res.json(basket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncBasket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { items } = req.body;

    const cleanItems = (items || []).map((i: any) => ({
      product: typeof i.product === 'object' && i.product !== null ? i.product._id : i.product,
      quantity: i.quantity || 1,
    })).filter((i: any) => Boolean(i.product));

    let basket = await Basket.findOne({ user: userId });
    
    if (basket) {
      basket.items = cleanItems as any;
      basket = await basket.save();
    } else {
      basket = await Basket.create({ user: userId, items: cleanItems });
    }

    const populatedBasket = await Basket.findById(basket._id).populate('items.product');
    res.json(populatedBasket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
