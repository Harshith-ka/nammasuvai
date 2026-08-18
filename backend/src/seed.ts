import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Product from './models/Product';
import Category from './models/Category';
import User from './models/User';
import Vendor from './models/Vendor';
import { dummyVendors } from './seed_vendors';

dotenv.config();

const categories = [
  { name: "Vegetables", slug: "vegetables" },
  { name: "Fruits", slug: "fruits" },
  { name: "Groceries", slug: "groceries" },
  { name: "Oils & Ghee", slug: "oils-and-ghee" },
  { name: "Specials", slug: "specials" }
];

const products = [
  {
    name: "Cabbage (Fresh Organic)",
    description: "Farm fresh cabbage. Crispy and sweet. Pesticide-free.",
    price: 35,
    weight: "500g",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1596265371388-43edbaadab94?w=500&auto=format&fit=crop"],
    categoryName: "Vegetables",
    isOrganic: true
  },
  {
    name: "Kovakkai (Ivy Gourd)",
    description: "Tender local kovakkai. Great for stir-fries and poriyal.",
    price: 28,
    weight: "250g",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop"],
    categoryName: "Vegetables",
    isOrganic: true
  },
  {
    name: "Seethaphal (Custard Apple)",
    description: "Sweet, naturally ripened seethaphal directly from orchards.",
    price: 120,
    weight: "1kg",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop"],
    categoryName: "Fruits",
    isOrganic: true
  },
  {
    name: "Yelakki Banana",
    description: "Small, sweet, and perfectly ripened yelakki bananas.",
    price: 85,
    weight: "1 Dozen",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop"],
    categoryName: "Fruits",
    isOrganic: true
  },
  {
    name: "Pure Wood-Pressed Coconut Oil",
    description: "Extracted from premium coconuts using traditional wood-pressing methods.",
    price: 320,
    weight: "1L",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1540148426945-36423984e8bc?w=500&auto=format&fit=crop"],
    categoryName: "Oils & Ghee",
    isOrganic: true
  },
  {
    name: "Organic Wheat Atta",
    description: "Stone-ground whole wheat atta. Perfect for soft rotis and parathas.",
    price: 65,
    weight: "1kg",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop"],
    categoryName: "Groceries",
    isOrganic: true
  },
  {
    name: "Red Poha (Aval)",
    description: "Traditional red poha, high in fibre and iron.",
    price: 45,
    weight: "500g",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop"],
    categoryName: "Groceries",
    isOrganic: true
  },
  {
    name: "Weekly Essential Veggie Basket",
    description: "The core of every kitchen. Balanced mix of organic staples for a family of four.",
    price: 850,
    weight: "6.5kg",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"],
    categoryName: "Specials",
    isOrganic: true,
    isCuratedBasket: true,
    basketItems: ['2kg Organic Potatoes', '1kg Heritage Onions', '500g Vine Tomatoes', '1kg Cabbage', '500g Kovakkai', '1.5kg Seasonal Mix'],
    tag: "★ Popular Choice"
  },
  {
    name: "Seasonal Fruits Box",
    description: "A colorful celebration of nature's candy. Seasonal and sun-ripened selection.",
    price: 1200,
    weight: "4.5kg",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop"],
    categoryName: "Specials",
    isOrganic: true,
    isCuratedBasket: true,
    basketItems: ['1 Dozen Yelakki Bananas', '1kg Seethaphal', '1 Large Papaya', '4 Seasonal Pears', '1 Small Watermelon'],
    tag: "🍊 Naturally Sweet"
  },
  {
    name: "Organic Pantry Starter Kit",
    description: "Everything you need to kickstart a healthy, organic kitchen.",
    price: 1450,
    weight: "4.0kg",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1595858102377-ce6a5d4314c4?w=800&auto=format&fit=crop"],
    categoryName: "Specials",
    isOrganic: true,
    isCuratedBasket: true,
    basketItems: ['1L Wood-Pressed Coconut Oil', '2kg Organic Wheat Atta', '500g Red Poha', '500g Toor Dal', '500g Moong Dal'],
    tag: "The Premium Choice"
  }
];

const fs = require('fs');
const path = require('path');

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';
    await mongoose.connect(uri, {
      dbName: 'organicmart'
    });
    console.log('MongoDB connected for seeding');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Vendor.deleteMany({});
    console.log('Cleared existing data');

    const createdVendors = await Vendor.insertMany(dummyVendors);
    console.log('Vendors seeded:', createdVendors.length);
    const vendorMap: Record<string, any> = {};
    createdVendors.forEach(v => { vendorMap[v.companyName] = v; });

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: "Super Admin",
      email: "admin@organichub.com",
      phone: "9999999999",
      password: hashedAdminPassword,
      role: "admin",
      isVerified: true
    });
    console.log('Admin user seeded (Phone: 9999999999 | Password: admin123)');

    // Parse the big dataset
    let parsedProducts = [];
    try {
      const parsedPath = path.join(__dirname, '../parsed_products.json');
      if (fs.existsSync(parsedPath)) {
        parsedProducts = JSON.parse(fs.readFileSync(parsedPath, 'utf8'));
      }
    } catch(err) {
      console.log('No parsed products found or error reading.', err);
    }

    const allProducts = [...products, ...parsedProducts];
    
    // Ensure categories exist
    const categoryNames = new Set(allProducts.map(p => p.categoryName));
    const finalCategories = Array.from(categoryNames).map(name => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));

    const createdCategories = await Category.insertMany(finalCategories);
    console.log('Categories created:', createdCategories.length);

    const productsWithCategory = allProducts.map((p, idx) => {
      const { categoryName, ...rest } = p;
      const cat = createdCategories.find(c => c.name === categoryName);
      const lowerName = (rest.name || "").toLowerCase();

      let targetVendorName = "NammaSuvai Central Organics";
      if (rest.isCuratedBasket || lowerName.includes("basket") || lowerName.includes("kit") || lowerName.includes("box")) {
        targetVendorName = "NammaSuvai Central Organics";
      } else if (categoryName === "Vegetables" || lowerName.includes("cabbage") || lowerName.includes("kovakkai") || lowerName.includes("potato") || lowerName.includes("carrot")) {
        targetVendorName = "GreenEarth Organic Farms";
      } else if (categoryName === "Fruits" || lowerName.includes("banana") || lowerName.includes("seethaphal") || lowerName.includes("papaya") || lowerName.includes("pear")) {
        targetVendorName = "Western Ghats Orchards Co-op";
      } else if (categoryName === "Oils & Ghee" || lowerName.includes("oil") || lowerName.includes("ghee")) {
        targetVendorName = "Malnad Wood-Pressed Oils & Dairy";
      } else if (lowerName.includes("honey") || lowerName.includes("turmeric") || lowerName.includes("spice")) {
        targetVendorName = "Nilgiri Tribal Harvest Co-op";
      } else if (categoryName === "Groceries") {
        targetVendorName = "Kaveri Delta Organic Collective";
      } else {
        const keys = Object.keys(vendorMap);
        targetVendorName = keys[idx % keys.length] || "NammaSuvai Central Organics";
      }

      const assignedVendor = vendorMap[targetVendorName] || vendorMap["NammaSuvai Central Organics"];

      return {
        ...rest,
        slug: (rest.name + '-' + idx).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        category: cat ? cat._id : null,
        user: adminUser._id,
        vendor: assignedVendor?._id,
        supplier: assignedVendor?.companyName || "NammaSuvai Central Organics"
      };
    });

    await Product.insertMany(productsWithCategory);
    console.log('Products created with vendor details:', productsWithCategory.length);

    console.log('Seeding successful');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
