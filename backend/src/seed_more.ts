import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';
import Category from './models/Category';

dotenv.config();

const newProducts = [
  {
    name: "Pure Desi Ghee",
    description: "A2 Gir Cow Ghee, Bilona Method • Pure & Aromatic",
    price: 850,
    weight: "500ml",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1634468641470-34fa9f0de3ea?w=500&auto=format&fit=crop"],
    categoryName: "Staples",
    isOrganic: true
  },
  {
    name: "Wild Forest Honey",
    description: "Raw, Unprocessed Honey • Sourced from Tribal Co-ops",
    price: 450,
    weight: "500g",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1587049352847-4d4b1ed74dd4?w=500&auto=format&fit=crop"],
    categoryName: "Groceries",
    isOrganic: true
  },
  {
    name: "Organic Turmeric Powder",
    description: "High Curcumin • Hand-ground",
    price: 180,
    weight: "250g",
    stock: 60,
    images: ["https://images.unsplash.com/photo-1615486511484-92e172054c04?w=500&auto=format&fit=crop"],
    categoryName: "Staples",
    isOrganic: true
  },
  {
    name: "Farm Fresh Free-Range Eggs",
    description: "Pasture Raised • Antibiotic Free",
    price: 240,
    weight: "12 Pack",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop"],
    categoryName: "Groceries",
    isOrganic: true
  },
  {
    name: "Immunity Booster Basket",
    description: "Packed with Vitamin C and Antioxidants to keep your family healthy.",
    price: 650,
    weight: "2.5kg",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=800&auto=format&fit=crop"],
    categoryName: "Specials",
    isOrganic: true,
    isCuratedBasket: true,
    basketItems: ['Amla (Indian Gooseberry)', 'Organic Turmeric', 'Ginger', 'Lemons', 'Forest Honey'],
    tag: "💪 Health First"
  },
  {
    name: "Dairy & Breakfast Box",
    description: "Start your morning right with pure, organic farm-fresh dairy and eggs.",
    price: 1100,
    weight: "3.0kg",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1627664375080-d21fffa584ab?w=800&auto=format&fit=crop"],
    categoryName: "Specials",
    isOrganic: true,
    isCuratedBasket: true,
    basketItems: ['A2 Milk (2 Litres)', 'Farm Fresh Eggs (12)', 'Desi Ghee (250ml)', 'Fresh Paneer (200g)'],
    tag: "🥛 Morning Essentials"
  },
  {
    name: "Exotic Fruit Basket",
    description: "Premium selection of exotic and seasonal fruits for a healthy treat.",
    price: 1550,
    weight: "5.0kg",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop"],
    categoryName: "Specials",
    isOrganic: true,
    isCuratedBasket: true,
    basketItems: ['Dragon Fruit', 'Kiwi Box', 'Avocados', 'Rambutan'],
    tag: "🌟 Premium Pick"
  }
];

const seedMore = async () => {
  try {
    const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';
    await mongoose.connect(uri, { dbName: 'organicmart' });
    console.log('MongoDB connected for adding more products');

    const categories = await Category.find({});
    
    const productsWithCategory = newProducts.map(p => {
      const { categoryName, ...rest } = p;
      const cat = categories.find(c => c.name === categoryName) || categories[0];
      return {
        ...rest,
        slug: rest.name.toLowerCase().replace(/ /g, '-'),
        category: cat?._id,
      };
    });

    await Product.insertMany(productsWithCategory);
    console.log('Additional Products created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedMore();
