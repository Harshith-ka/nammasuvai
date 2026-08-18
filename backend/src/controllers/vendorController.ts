import { Request, Response } from 'express';
import Vendor from '../models/Vendor';
import Product from '../models/Product';
import Order from '../models/Order';

export const getVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    
    // Attach product count for each vendor
    const vendorsWithCount = await Promise.all(
      vendors.map(async (vendor) => {
        const productCount = await Product.countDocuments({ vendor: vendor._id });
        return {
          ...vendor.toObject(),
          productCount,
        };
      })
    );

    res.json(vendorsWithCount);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }
    const productCount = await Product.countDocuments({ vendor: vendor._id });
    res.json({ ...vendor.toObject(), productCount });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, companyName, email, phone, address, commissionRate, status, bankDetails, notes } = req.body;

    const existingVendor = await Vendor.findOne({ companyName });
    if (existingVendor) {
      res.status(400).json({ message: 'Vendor with this Company Name already exists' });
      return;
    }

    const vendor = new Vendor({
      name,
      companyName,
      email,
      phone,
      address,
      commissionRate: commissionRate || 10,
      status: status || 'Active',
      bankDetails: bankDetails || {},
      notes: notes || '',
    });

    const savedVendor = await vendor.save();
    res.status(201).json(savedVendor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    Object.assign(vendor, req.body);
    const updatedVendor = await vendor.save();
    res.json(updatedVendor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    // Unlink vendor from any products
    await Product.updateMany({ vendor: vendor._id }, { $unset: { vendor: '' } });
    await vendor.deleteOne();

    res.json({ message: 'Vendor removed successfully and unlinked from products' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    const products = await Product.find({ vendor: vendor._id }).populate('category', 'name');
    const productIds = products.map((p) => p._id.toString());

    // Find all orders containing any of this vendor's products
    const orders = await Order.find({
      'orderItems.product': { $in: productIds },
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    let totalRevenue = 0;
    let totalUnitsSold = 0;
    let totalOrders = orders.length;
    let activeStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);

    // Track product performance
    const productPerformanceMap: Record<string, { unitsSold: number; revenue: number }> = {};
    products.forEach((p) => {
      productPerformanceMap[p._id.toString()] = { unitsSold: 0, revenue: 0 };
    });

    // Track monthly sales for the past 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: Record<string, { month: string; revenue: number; units: number; ordersCount: number; sortKey: number }> = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const sortKey = d.getFullYear() * 100 + d.getMonth();
      monthlyDataMap[label] = { month: label, revenue: 0, units: 0, ordersCount: 0, sortKey };
    }

    const vendorOrdersList: any[] = [];

    orders.forEach((order) => {
      // Filter items belonging to this vendor
      const vendorItems = order.orderItems.filter((item) =>
        productIds.includes(item.product.toString())
      );

      if (vendorItems.length === 0) return;

      let orderVendorTotal = 0;
      let orderVendorUnits = 0;

      vendorItems.forEach((item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        orderVendorTotal += itemTotal;
        orderVendorUnits += item.quantity || 0;

        const pid = item.product.toString();
        if (productPerformanceMap[pid]) {
          productPerformanceMap[pid].unitsSold += item.quantity || 0;
          productPerformanceMap[pid].revenue += itemTotal;
        }
      });

      totalRevenue += orderVendorTotal;
      totalUnitsSold += orderVendorUnits;

      // Group into monthly stats
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const label = `${monthNames[orderDate.getMonth()]} ${orderDate.getFullYear().toString().slice(-2)}`;
        if (monthlyDataMap[label]) {
          monthlyDataMap[label].revenue += orderVendorTotal;
          monthlyDataMap[label].units += orderVendorUnits;
          monthlyDataMap[label].ordersCount += 1;
        }
      }

      vendorOrdersList.push({
        _id: order._id,
        createdAt: order.createdAt,
        user: order.user,
        items: vendorItems,
        vendorOrderTotal: orderVendorTotal,
        orderStatus: order.orderStatus,
        isPaid: order.isPaid,
      });
    });

    const monthlySales = Object.values(monthlyDataMap)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, revenue, units, ordersCount }) => ({ month, revenue, units, ordersCount }));

    const productsPerformance = products.map((p) => {
      const perf = productPerformanceMap[p._id.toString()] || { unitsSold: 0, revenue: 0 };
      let status = 'In Stock';
      if (p.stock <= 0) status = 'Out of Stock';
      else if (p.stock <= 10) status = 'Low Stock';

      return {
        _id: p._id,
        name: p.name,
        image: p.images?.[0] || '',
        category: (p.category as any)?.name || 'General',
        price: p.price,
        stock: p.stock,
        unitsSold: perf.unitsSold,
        revenue: perf.revenue,
        status,
      };
    });

    res.json({
      vendor,
      kpis: {
        totalRevenue,
        totalOrders,
        totalUnitsSold,
        totalProducts: products.length,
        activeStock,
      },
      productsPerformance,
      orders: vendorOrdersList,
      monthlySales,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
