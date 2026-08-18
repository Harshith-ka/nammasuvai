import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, parentCategory, subCategories } = req.body;
    
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      res.status(400).json({ message: 'Category with this slug already exists' });
      return;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory,
      subCategories: subCategories || []
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({}).populate('parentCategory', 'name slug');
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.slug || category.slug;
      category.description = req.body.description !== undefined ? req.body.description : category.description;
      category.image = req.body.image || category.image;
      category.parentCategory = req.body.parentCategory || category.parentCategory;
      if (req.body.subCategories !== undefined) {
        category.subCategories = req.body.subCategories;
      }

      const updatedCategory = await category.save();

      // If oldSubCategory and newSubCategory are provided, update any products referencing that old subcategory
      if (req.body.oldSubCategory && req.body.newSubCategory) {
        await Product.updateMany(
          { category: category._id, subCategory: req.body.oldSubCategory },
          { $set: { subCategory: req.body.newSubCategory } }
        );
      }

      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
