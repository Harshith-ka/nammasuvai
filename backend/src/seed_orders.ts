import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';
import User from './models/User';
import Address from './models/Address';
import Order from './models/Order';

dotenv.config();

const mockCustomersData = [
  {
    name: "Ananya Iyer",
    phone: "9876543210",
    email: "ananya.iyer@example.com",
    role: "customer",
    address: {
      fullName: "Ananya Iyer",
      phone: "9876543210",
      streetAddress: "14, Poes Garden, Teynampet",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600086",
      country: "India",
      isDefault: true
    }
  },
  {
    name: "Rajesh Kumar",
    phone: "9123456789",
    email: "rajesh.kumar@example.com",
    role: "customer",
    address: {
      fullName: "Rajesh Kumar",
      phone: "9123456789",
      streetAddress: "45, Indiranagar Double Road, 2nd Stage",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefault: true
    }
  },
  {
    name: "Priya Sundaram",
    phone: "9345678901",
    email: "priya.s@example.com",
    role: "customer",
    address: {
      fullName: "Priya Sundaram",
      phone: "9345678901",
      streetAddress: "78, RS Puram West, TV Swamy Road",
      city: "Coimbatore",
      state: "Tamil Nadu",
      postalCode: "641002",
      country: "India",
      isDefault: true
    }
  },
  {
    name: "Karthik Natarajan",
    phone: "9456789012",
    email: "karthik.n@example.com",
    role: "customer",
    address: {
      fullName: "Karthik Natarajan",
      phone: "9456789012",
      streetAddress: "12, Jubilee Hills, Road No 36",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500033",
      country: "India",
      isDefault: true
    }
  }
];

const seedOrders = async () => {
  try {
    const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';
    await mongoose.connect(uri, { dbName: 'organicmart' });
    console.log('🌱 MongoDB connected for seeding test orders...');

    const products = await Product.find({});
    if (products.length === 0) {
      console.log('⚠️ No products found in DB. Please seed products first using `npm run seed`');
      process.exit(1);
    }

    console.log(`📦 Found ${products.length} products in catalog.`);

    // 1. Create or fetch users and their addresses
    const userAddressPairs: { user: any; address: any }[] = [];
    for (const custData of mockCustomersData) {
      let user = await User.findOne({ phone: custData.phone });
      if (!user) {
        user = await User.create({
          name: custData.name,
          phone: custData.phone,
          email: custData.email,
          role: 'customer'
        });
      }

      let address = await Address.findOne({ user: user._id, streetAddress: custData.address.streetAddress });
      if (!address) {
        address = await Address.create({
          ...custData.address,
          user: user._id
        });
      }

      userAddressPairs.push({ user, address });
    }

    // 2. Define varied order templates across dates and statuses
    const now = new Date();
    const getDate = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const orderTemplates = [
      {
        pairIdx: 0,
        daysAgo: 0,
        status: 'Placed',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 0, qty: 3, custom: ['Morning Farm Harvest', 'No Plastic Wrap'] },
          { prodIdx: 1, qty: 2, custom: ['Extra Green Tender Cut'] }
        ]
      },
      {
        pairIdx: 1,
        daysAgo: 0,
        status: 'Confirmed',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 2, qty: 4, custom: ['Standard Farm Cut'] },
          { prodIdx: 3, qty: 1, custom: ['Ripe & Sweet Selection'] }
        ]
      },
      {
        pairIdx: 2,
        daysAgo: 0,
        status: 'Packed',
        paymentMethod: 'COD',
        isPaid: false,
        items: [
          { prodIdx: 4, qty: 2, custom: ['Wood Pressed Batch'] },
          { prodIdx: 0, qty: 5, custom: ['Crispy Heads Only', 'Eco Paper Bag'] }
        ]
      },
      {
        pairIdx: 3,
        daysAgo: 1,
        status: 'Confirmed',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 1, qty: 3, custom: ['Tender Kovakkai'] },
          { prodIdx: 2, qty: 2, custom: ['Organic Orchard Pick'] }
        ]
      },
      {
        pairIdx: 0,
        daysAgo: 1,
        status: 'Packed',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 3, qty: 2, custom: ['Yellow Ripe Yelakki'] }
        ]
      },
      {
        pairIdx: 1,
        daysAgo: 2,
        status: 'Shipped',
        paymentMethod: 'COD',
        isPaid: false,
        items: [
          { prodIdx: 0, qty: 2, custom: ['Fresh Farm Cut'] },
          { prodIdx: 4, qty: 1, custom: ['Glass Bottle'] }
        ]
      },
      {
        pairIdx: 2,
        daysAgo: 3,
        status: 'Delivered',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 1, qty: 5, custom: ['No Plastic'] },
          { prodIdx: 3, qty: 3, custom: ['Family Pack'] }
        ]
      },
      {
        pairIdx: 3,
        daysAgo: 4,
        status: 'Delivered',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 2, qty: 2, custom: ['Ripe Orchard Harvest'] },
          { prodIdx: 4, qty: 2, custom: ['Standard Wood Pressed'] }
        ]
      },
      {
        pairIdx: 0,
        daysAgo: 5,
        status: 'Delivered',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 0, qty: 4, custom: ['Standard Farm Cut'] },
          { prodIdx: 1, qty: 3, custom: ['Tender Green'] },
          { prodIdx: 2, qty: 1, custom: ['Sweet Seethaphal'] }
        ]
      },
      {
        pairIdx: 1,
        daysAgo: 6,
        status: 'Delivered',
        paymentMethod: 'COD',
        isPaid: true,
        items: [
          { prodIdx: 3, qty: 2, custom: ['Morning Harvest'] }
        ]
      },
      {
        pairIdx: 2,
        daysAgo: 7,
        status: 'Delivered',
        paymentMethod: 'Paytm',
        isPaid: true,
        items: [
          { prodIdx: 0, qty: 6, custom: ['Wholesale Farm Pack'] },
          { prodIdx: 4, qty: 1, custom: ['Pure Oil'] }
        ]
      },
      {
        pairIdx: 3,
        daysAgo: 0,
        status: 'Placed',
        paymentMethod: 'COD',
        isPaid: false,
        items: [
          { prodIdx: 2, qty: 3, custom: ['Gift Box Packaging'] },
          { prodIdx: 1, qty: 4, custom: ['Fresh Daily Cut'] }
        ]
      }
    ];

    const ordersToInsert: any[] = [];

    for (const tpl of orderTemplates) {
      const pair = userAddressPairs[tpl.pairIdx % userAddressPairs.length] || userAddressPairs[0];
      if (!pair) continue;
      const { user, address } = pair;
      const orderDate = getDate(tpl.daysAgo);

      let itemsPrice = 0;
      const orderItems = tpl.items.map(itemSpec => {
        const prod = products[itemSpec.prodIdx % products.length] || products[0];
        if (!prod) return null;
        const price = prod.price || 50;
        itemsPrice += price * itemSpec.qty;
        return {
          product: prod._id,
          name: prod.name,
          weight: prod.weight || '500g',
          price: price,
          quantity: itemSpec.qty,
          image: prod.images?.[0] || 'https://images.unsplash.com/photo-1596265371388-43edbaadab94?w=500',
          customizations: itemSpec.custom
        };
      }).filter(Boolean);

      const shippingPrice = itemsPrice > 500 ? 0 : 40;
      const taxPrice = Math.round(itemsPrice * 0.05);
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      ordersToInsert.push({
        user: user._id,
        orderItems,
        shippingAddress: address._id,
        paymentMethod: tpl.paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: tpl.isPaid,
        paidAt: tpl.isPaid ? orderDate : undefined,
        orderStatus: tpl.status,
        deliveredAt: tpl.status === 'Delivered' ? new Date(orderDate.getTime() + 86400000) : undefined,
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    await Order.insertMany(ordersToInsert);
    console.log(`✅ Successfully seeded ${ordersToInsert.length} rich test orders!`);
    console.log(`📊 You can now test all 7 Enterprise Reports in the Admin Panel!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  }
};

seedOrders();
