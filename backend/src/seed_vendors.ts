import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './models/Vendor';
import Product from './models/Product';
import Category from './models/Category';

dotenv.config();

export const dummyVendors = [
  {
    name: "Ramesh Swamy",
    companyName: "GreenEarth Organic Farms",
    email: "ramesh@greenearthfarms.in",
    phone: "9845012345",
    address: "Ooty Road, Mettupalayam, Tamil Nadu - 641301",
    commissionRate: 10,
    status: "Active" as const,
    bankDetails: {
      accountNumber: "501002345678",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234",
      upiId: "greenearth@hdfc"
    },
    notes: "Specializes in high-altitude hill vegetables (Cabbage, Carrots, Potatoes, Kovakkai). Certified Organic NPOP/NAB/001."
  },
  {
    name: "Lakshmi Narayanan",
    companyName: "Western Ghats Orchards Co-op",
    email: "lakshmi@westernghatsorchards.com",
    phone: "9443219876",
    address: "Lower Palani Hills, Kodaikanal, Tamil Nadu - 624101",
    commissionRate: 12,
    status: "Active" as const,
    bankDetails: {
      accountNumber: "31234567890",
      bankName: "State Bank of India",
      ifscCode: "SBIN0000845",
      upiId: "wghats@sbi"
    },
    notes: "Primary grower of naturally sun-ripened fruits (Yelakki Banana, Seethaphal, Papaya, Seasonal Pears)."
  },
  {
    name: "Prakash Hegde",
    companyName: "Malnad Wood-Pressed Oils & Dairy",
    email: "prakash@malnadorganics.in",
    phone: "9986543210",
    address: "Sirsi-Siralkoppa Road, Shimoga District, Karnataka - 577401",
    commissionRate: 8,
    status: "Active" as const,
    bankDetails: {
      accountNumber: "0045104000123",
      bankName: "ICICI Bank",
      ifscCode: "ICIC0000045",
      upiId: "malnadoil@icici"
    },
    notes: "Master producers of A2 Gir Cow Desi Ghee and wood-pressed coconut and groundnut oils using traditional wooden Mara Chekku."
  },
  {
    name: "Sundaramurthy K.",
    companyName: "Kaveri Delta Organic Collective",
    email: "contact@kaveridelta.org",
    phone: "9789012345",
    address: "Thanjavur Agraharam, Thanjavur, Tamil Nadu - 613001",
    commissionRate: 10,
    status: "Active" as const,
    bankDetails: {
      accountNumber: "112233445566",
      bankName: "Indian Bank",
      ifscCode: "IDIB000T012",
      upiId: "kaveridelta@indianbank"
    },
    notes: "Heritage stone-ground flours (Organic Wheat Atta), traditional rice varieties, Red Poha (Aval), and farm-fresh dals."
  },
  {
    name: "K. Bomman",
    companyName: "Nilgiri Tribal Harvest Co-op",
    email: "honey@nilgiriharvest.in",
    phone: "9487654321",
    address: "Kotagiri Forest Border, Nilgiris, Tamil Nadu - 643217",
    commissionRate: 10,
    status: "Active" as const,
    bankDetails: {
      accountNumber: "67890123456",
      bankName: "Canara Bank",
      ifscCode: "CNRB0001423",
      upiId: "nilgirihoney@cnrb"
    },
    notes: "Ethically harvested wild forest honey, organic hill spices, turmeric, and herbal wellness staples."
  },
  {
    name: "Rajesh NammaSuvai",
    companyName: "NammaSuvai Central Organics",
    email: "sourcing@nammasuvai.com",
    phone: "9840001122",
    address: "NammaSuvai Central Warehouse, Ekkaduthangal, Chennai - 600032",
    commissionRate: 5,
    status: "Active" as const,
    bankDetails: {
      accountNumber: "998877665544",
      bankName: "Axis Bank",
      ifscCode: "UTIB0000111",
      upiId: "nammasuvai@axisbank"
    },
    notes: "Central curated baskets, pantry starter kits, weekly essential boxes, and direct farm aggregation."
  }
];

const seedVendorDetails = async () => {
  try {
    const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';
    await mongoose.connect(uri, {
      dbName: 'organicmart'
    });
    console.log('MongoDB connected for seeding/updating vendor details');

    // 1. Seed / Upsert dummy vendors
    const vendorMap: Record<string, any> = {};
    for (const vData of dummyVendors) {
      let vendor = await Vendor.findOne({ companyName: vData.companyName });
      if (!vendor) {
        vendor = await Vendor.create(vData);
      } else {
        Object.assign(vendor, vData);
        await vendor.save();
      }
      vendorMap[vData.companyName] = vendor;
    }
    console.log(`Seeded/Updated ${dummyVendors.length} dummy vendors.`);

    // 2. Fetch categories to help classify products
    const categories = await Category.find({});
    const categoryMap: Record<string, string> = {};
    categories.forEach(c => {
      categoryMap[c._id.toString()] = c.name;
    });

    // 3. Update all existing products with vendor & supplier details
    const allProducts = await Product.find({});
    let updatedCount = 0;

    for (const product of allProducts) {
      const catName = (product.category && categoryMap[product.category.toString()]) || "";
      const lowerName = product.name.toLowerCase();

      let targetVendorName = "NammaSuvai Central Organics";

      if (product.isCuratedBasket || lowerName.includes("basket") || lowerName.includes("kit") || lowerName.includes("box")) {
        targetVendorName = "NammaSuvai Central Organics";
      } else if (catName === "Vegetables" || lowerName.includes("cabbage") || lowerName.includes("kovakkai") || lowerName.includes("potato") || lowerName.includes("carrot") || lowerName.includes("onion") || lowerName.includes("tomato")) {
        targetVendorName = "GreenEarth Organic Farms";
      } else if (catName === "Fruits" || lowerName.includes("banana") || lowerName.includes("seethaphal") || lowerName.includes("papaya") || lowerName.includes("pear") || lowerName.includes("mango") || lowerName.includes("apple")) {
        targetVendorName = "Western Ghats Orchards Co-op";
      } else if (catName === "Oils & Ghee" || lowerName.includes("oil") || lowerName.includes("ghee") || lowerName.includes("butter")) {
        targetVendorName = "Malnad Wood-Pressed Oils & Dairy";
      } else if (lowerName.includes("honey") || lowerName.includes("turmeric") || lowerName.includes("spice") || lowerName.includes("amla")) {
        targetVendorName = "Nilgiri Tribal Harvest Co-op";
      } else if (catName === "Groceries" || lowerName.includes("atta") || lowerName.includes("poha") || lowerName.includes("rice") || lowerName.includes("dal") || lowerName.includes("egg")) {
        targetVendorName = "Kaveri Delta Organic Collective";
      } else {
        // Distribute round robin if needed
        const keys = Object.keys(vendorMap);
        targetVendorName = keys[updatedCount % keys.length] || "NammaSuvai Central Organics";
      }

      const assignedVendor = vendorMap[targetVendorName] || vendorMap["NammaSuvai Central Organics"];
      product.vendor = assignedVendor._id;
      product.supplier = assignedVendor.companyName;
      await product.save();
      updatedCount++;
    }

    console.log(`Successfully updated vendor & supplier details for ${updatedCount} products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding/updating vendor details:', error);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].includes('seed_vendors')) {
  seedVendorDetails();
}
