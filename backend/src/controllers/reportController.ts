import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Category from '../models/Category';
import PDFDocument from 'pdfkit';

// Utility: Send CSV Response
const sendCSV = (res: Response, filename: string, headers: string[], rows: (string | number)[][]) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

  const escapeField = (field: string | number) => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeField).join(','),
    ...rows.map(row => row.map(escapeField).join(','))
  ].join('\n');

  res.status(200).send(csvContent);
};

// Utility: Send Formatted PDF Response
const sendPDF = (
  res: Response,
  filename: string,
  title: string,
  subtitle: string,
  columns: string[],
  rows: (string | number)[][],
  summaryTotals?: { label: string; value: string }[]
) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: columns.length > 5 ? 'landscape' : 'portrait' });
  doc.pipe(res);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Header Banner
  doc.rect(0, 0, doc.page.width, 70).fill('#1A4027');
  doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('NammaSuvai / Organic Hub', 40, 20);
  doc.fontSize(10).font('Helvetica').fillColor('#DCEAD8').text('ENTERPRISE PROCUREMENT & OPERATIONS REPORT', 40, 45);

  // Title & Subtitle
  doc.moveDown(2);
  doc.fillColor('#1A4027').fontSize(16).font('Helvetica-Bold').text(title, 40, 85);
  doc.fillColor('#666666').fontSize(10).font('Helvetica').text(`${subtitle} | Generated on ${new Date().toLocaleString('en-IN')}`, 40, 105);

  let y = 130;
  const colWidth = pageWidth / columns.length;

  // Table Header Row
  doc.rect(40, y, pageWidth, 25).fill('#EBF5EC');
  doc.fillColor('#1A4027').fontSize(9).font('Helvetica-Bold');
  columns.forEach((col, i) => {
    doc.text(col, 45 + i * colWidth, y + 8, { width: colWidth - 10, align: 'left', ellipsis: true });
  });

  y += 25;
  doc.font('Helvetica').fontSize(8);

  // Table Data Rows
  rows.forEach((row, rowIndex) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 40;
      // Redraw Table Header on new page
      doc.rect(40, y, pageWidth, 25).fill('#EBF5EC');
      doc.fillColor('#1A4027').fontSize(9).font('Helvetica-Bold');
      columns.forEach((col, i) => {
        doc.text(col, 45 + i * colWidth, y + 8, { width: colWidth - 10, align: 'left', ellipsis: true });
      });
      y += 25;
      doc.font('Helvetica').fontSize(8);
    }

    if (rowIndex % 2 === 1) {
      doc.rect(40, y, pageWidth, 20).fill('#FDFBF7');
    }

    doc.fillColor('#333333');
    row.forEach((cell, i) => {
      doc.text(String(cell !== undefined && cell !== null ? cell : '-'), 45 + i * colWidth, y + 5, {
        width: colWidth - 10,
        align: 'left',
        ellipsis: true,
        height: 15
      });
    });

    doc.rect(40, y + 20, pageWidth, 0.5).fill('#DCEAD8');
    y += 20;
  });

  // Summary Totals Footer
  if (summaryTotals && summaryTotals.length > 0) {
    y += 15;
    if (y > doc.page.height - 80) { doc.addPage(); y = 40; }
    doc.rect(40, y, pageWidth, 30 + summaryTotals.length * 15).fill('#F0F7F1');
    doc.rect(40, y, pageWidth, 2).fill('#1A4027');
    
    doc.fillColor('#1A4027').fontSize(10).font('Helvetica-Bold').text('SUMMARY STATS & TOTALS', 50, y + 10);
    y += 25;
    
    summaryTotals.forEach(stat => {
      doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold').text(`${stat.label}:`, 50, y);
      doc.fillColor('#1A4027').font('Helvetica-Bold').text(stat.value, 200, y);
      y += 15;
    });
  }

  // Footer / Page Numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#999999').fontSize(8).font('Helvetica').text(
      `Page ${i + 1} of ${pages.count} - NammaSuvai Confidential`,
      40,
      doc.page.height - 30,
      { align: 'center', width: pageWidth }
    );
  }

  doc.end();
};

// Helper: Get Date Range Filter
const getDateFilter = (req: Request) => {
  const { startDate, endDate } = req.query;
  const filter: any = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }
  return filter;
};

// Helper: Get Status Filter
const getStatusFilter = (req: Request) => {
  const { status } = req.query;
  if (status && status !== 'All') {
    return { orderStatus: status };
  }
  // By default exclude Cancelled for procurement reports
  return { orderStatus: { $ne: 'Cancelled' } };
};

// 1. Generate OPL (Order Procurement List)
export const generateOPL = async (req: Request, res: Response): Promise<void> => {
  try {
    const dateFilter = getDateFilter(req);
    const statusFilter = getStatusFilter(req);
    const query = { ...dateFilter, ...statusFilter };

    const orders = await Order.find(query).populate('orderItems.product');

    const procMap: Record<string, { id: string; name: string; weight: string; qty: number; totalCost: number }> = {};

    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const key = item.name;
        if (!procMap[key]) {
          procMap[key] = {
            id: item.product ? item.product.toString().slice(-6) : 'N/A',
            name: item.name,
            weight: item.weight || '1 Kg',
            qty: 0,
            totalCost: 0
          };
        }
        procMap[key].qty += (item.quantity || (item as any).qty || 1);
        procMap[key].totalCost += (item.price * (item.quantity || (item as any).qty || 1));
      });
    });

    const data = Object.values(procMap).sort((a, b) => b.qty - a.qty);
    const totalQty = data.reduce((acc, d) => acc + d.qty, 0);
    const totalValue = data.reduce((acc, d) => acc + d.totalCost, 0);

    const format = req.query.format as string;
    if (format === 'csv') {
      const headers = ['Product Code', 'Product Name', 'Unit Weight', 'Total Quantity Required', 'Estimated Procurement Value (INR)'];
      const rows = data.map(d => [d.id, d.name, d.weight, d.qty, `₹${d.totalCost}`]);
      return sendCSV(res, 'Order_Procurement_List_OPL', headers, rows);
    }

    if (format === 'pdf') {
      const columns = ['Code', 'Product Name', 'Unit Weight', 'Quantity Needed', 'Est. Value'];
      const rows = data.map(d => [d.id, d.name, d.weight, `${d.qty} Units`, `₹${d.totalCost}`]);
      return sendPDF(res, 'Order_Procurement_List_OPL', 'Order Procurement List (OPL)', 'Aggregated Pick List across Active Orders', columns, rows, [
        { label: 'Total Unique Products', value: `${data.length} Items` },
        { label: 'Total Units to Procure', value: `${totalQty} Units` },
        { label: 'Total Estimated Value', value: `₹${totalValue}` }
      ]);
    }

    res.status(200).json({ data, summary: { totalProducts: data.length, totalQty, totalValue } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating OPL report' });
  }
};

// 2. Generate OPL by Product Type / Category
export const generateOPLbyProductType = async (req: Request, res: Response): Promise<void> => {
  try {
    const dateFilter = getDateFilter(req);
    const statusFilter = getStatusFilter(req);
    const query = { ...dateFilter, ...statusFilter };

    const orders = await Order.find(query);
    const products = await Product.find({}).populate('category');

    const prodCategoryMap: Record<string, string> = {};
    products.forEach(p => {
      prodCategoryMap[p.name] = (p.category as any)?.name || 'General / Staples';
    });

    const catMap: Record<string, { category: string; name: string; weight: string; qty: number; value: number }> = {};

    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const cat = prodCategoryMap[item.name] || 'General Produce';
        const key = `${cat}_${item.name}`;
        if (!catMap[key]) {
          catMap[key] = {
            category: cat,
            name: item.name,
            weight: item.weight || '1 Kg',
            qty: 0,
            value: 0
          };
        }
        catMap[key].qty += (item.quantity || (item as any).qty || 1);
        catMap[key].value += (item.price * (item.quantity || (item as any).qty || 1));
      });
    });

    const data = Object.values(catMap).sort((a, b) => a.category.localeCompare(b.category) || b.qty - a.qty);
    const totalQty = data.reduce((acc, d) => acc + d.qty, 0);
    const totalValue = data.reduce((acc, d) => acc + d.value, 0);

    const format = req.query.format as string;
    if (format === 'csv') {
      const headers = ['Category / Product Type', 'Product Name', 'Unit Weight', 'Total Quantity Required', 'Total Value (INR)'];
      const rows = data.map(d => [d.category, d.name, d.weight, d.qty, `₹${d.value}`]);
      return sendCSV(res, 'OPL_By_Product_Type', headers, rows);
    }

    if (format === 'pdf') {
      const columns = ['Category', 'Product Name', 'Unit Weight', 'Quantity', 'Total Value'];
      const rows = data.map(d => [d.category, d.name, d.weight, `${d.qty} Units`, `₹${d.value}`]);
      return sendPDF(res, 'OPL_By_Product_Type', 'Procurement List by Product Type', 'Categorized Pick List for Farm Harvest & Sortation', columns, rows, [
        { label: 'Total Categories Covered', value: `${new Set(data.map(d => d.category)).size} Categories` },
        { label: 'Total Units Needed', value: `${totalQty} Units` },
        { label: 'Total Procurement Value', value: `₹${totalValue}` }
      ]);
    }

    res.status(200).json({ data, summary: { totalCategories: new Set(data.map(d => d.category)).size, totalQty, totalValue } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating category OPL' });
  }
};

// 3. Aggregate Suppliers / Farmer Sources
export const AggregateSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const dateFilter = getDateFilter(req);
    const statusFilter = getStatusFilter(req);
    const query = { ...dateFilter, ...statusFilter };

    const orders = await Order.find(query);
    const products = await Product.find({});

    const prodSupplierMap: Record<string, string> = {};
    products.forEach(p => {
      prodSupplierMap[p.name] = p.supplier || 'NammaSuvai Central Organics';
    });

    const suppMap: Record<string, { supplier: string; name: string; weight: string; qty: number; estCost: number }> = {};

    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const supp = prodSupplierMap[item.name] || 'NammaSuvai Central Organics';
        const key = `${supp}_${item.name}`;
        if (!suppMap[key]) {
          suppMap[key] = {
            supplier: supp,
            name: item.name,
            weight: item.weight || '1 Kg',
            qty: 0,
            estCost: 0
          };
        }
        const q = (item.quantity || (item as any).qty || 1);
        suppMap[key].qty += q;
        suppMap[key].estCost += (item.price * q * 0.75); // Est farm cost at 75% retail
      });
    });

    const data = Object.values(suppMap).sort((a, b) => a.supplier.localeCompare(b.supplier) || b.qty - a.qty);
    const totalQty = data.reduce((acc, d) => acc + d.qty, 0);
    const totalCost = data.reduce((acc, d) => acc + d.estCost, 0);

    const format = req.query.format as string;
    if (format === 'csv') {
      const headers = ['Farmer / Supplier Name', 'Product Name', 'Unit Weight', 'Procurement Quantity', 'Est. Farm Cost (INR)'];
      const rows = data.map(d => [d.supplier, d.name, d.weight, d.qty, `₹${Math.round(d.estCost)}`]);
      return sendCSV(res, 'Supplier_Procurement_Aggregation', headers, rows);
    }

    if (format === 'pdf') {
      const columns = ['Supplier / Farmer Source', 'Product Name', 'Unit Weight', 'Qty Needed', 'Est. Farm Cost'];
      const rows = data.map(d => [d.supplier, d.name, d.weight, `${d.qty} Units`, `₹${Math.round(d.estCost)}`]);
      return sendPDF(res, 'Supplier_Procurement_Aggregation', 'Supplier Procurement Aggregation', 'Farmer Purchase & Sourcing Matrix', columns, rows, [
        { label: 'Active Farm Suppliers', value: `${new Set(data.map(d => d.supplier)).size} Suppliers` },
        { label: 'Total Units from Farms', value: `${totalQty} Units` },
        { label: 'Estimated Total Farm Payout', value: `₹${Math.round(totalCost)}` }
      ]);
    }

    res.status(200).json({ data, summary: { totalSuppliers: new Set(data.map(d => d.supplier)).size, totalQty, totalCost: Math.round(totalCost) } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error aggregating suppliers' });
  }
};

// 4. Generate Order List / Delivery Manifest
export const GenerateOrderList = async (req: Request, res: Response): Promise<void> => {
  try {
    const dateFilter = getDateFilter(req);
    const statusFilter = getStatusFilter(req);
    const query = { ...dateFilter, ...statusFilter };

    const orders = await Order.find(query).populate('user', 'name phone email').populate('shippingAddress').sort({ createdAt: -1 });

    const data = orders.map(o => {
      const addr = (o.shippingAddress as any);
      const user = (o.user as any);
      const fullAddress = addr ? `${addr.streetAddress || addr.address}, ${addr.city} - ${addr.postalCode}` : 'Address not recorded';
      return {
        orderId: o._id.toString().slice(-6),
        customerName: user?.name || addr?.fullName || 'Guest',
        phone: user?.phone || addr?.phone || 'N/A',
        address: fullAddress,
        itemsCount: o.orderItems?.length || 0,
        totalPrice: o.totalPrice || 0,
        paymentMethod: o.paymentMethod || 'Online',
        paymentStatus: o.isPaid ? 'Paid' : 'Pending',
        status: o.orderStatus || 'Placed',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A'
      };
    });

    const totalRevenue = data.reduce((acc, d) => acc + d.totalPrice, 0);

    const format = req.query.format as string;
    if (format === 'csv') {
      const headers = ['Order ID', 'Customer Name', 'Contact Phone', 'Delivery Address', 'Items Count', 'Total Amount (INR)', 'Payment Status', 'Order Status', 'Order Date'];
      const rows = data.map(d => [d.orderId, d.customerName, d.phone, d.address, d.itemsCount, `₹${d.totalPrice}`, d.paymentStatus, d.status, d.date]);
      return sendCSV(res, 'Dispatch_Order_Manifest_List', headers, rows);
    }

    if (format === 'pdf') {
      const columns = ['ID', 'Customer Name', 'Phone', 'Delivery Address', 'Amount', 'Payment', 'Status'];
      const rows = data.map(d => [d.orderId, d.customerName, d.phone, d.address, `₹${d.totalPrice}`, d.paymentStatus, d.status]);
      return sendPDF(res, 'Dispatch_Order_Manifest_List', 'Order Delivery & Dispatch Manifest', 'Comprehensive Customer Order Directory for Logistics Routing', columns, rows, [
        { label: 'Total Orders in Manifest', value: `${data.length} Orders` },
        { label: 'Total Manifest Revenue', value: `₹${totalRevenue}` },
        { label: 'Paid Orders Count', value: `${data.filter(d => d.paymentStatus === 'Paid').length} Orders` }
      ]);
    }

    res.status(200).json({ data, summary: { totalOrders: data.length, totalRevenue } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating order list' });
  }
};

// 5. Generate Order Preferences & Customizations
export const GenerateOrderPrefereneces = async (req: Request, res: Response): Promise<void> => {
  try {
    const dateFilter = getDateFilter(req);
    const statusFilter = getStatusFilter(req);
    const query = { ...dateFilter, ...statusFilter };

    const orders = await Order.find(query).populate('user', 'name phone').populate('shippingAddress').sort({ createdAt: -1 });

    const data: any[] = [];
    orders.forEach(o => {
      const user = (o.user as any);
      const addr = (o.shippingAddress as any);
      o.orderItems?.forEach(item => {
        const cust = item.customizations && item.customizations.length > 0 ? item.customizations.join('; ') : 'Standard Farm Cut';
        data.push({
          orderId: o._id.toString().slice(-6),
          customerName: user?.name || addr?.fullName || 'Guest',
          productName: item.name,
          weight: item.weight || '1 Kg',
          qty: item.quantity || (item as any).qty || 1,
          customizations: cust,
          deliverySlot: 'Morning (7 AM - 9 AM)'
        });
      });
    });

    const format = req.query.format as string;
    if (format === 'csv') {
      const headers = ['Order ID', 'Customer Name', 'Product Name', 'Unit Weight', 'Quantity', 'Customizations / Instructions', 'Preferred Delivery Slot'];
      const rows = data.map(d => [d.orderId, d.customerName, d.productName, d.weight, d.qty, d.customizations, d.deliverySlot]);
      return sendCSV(res, 'Customer_Order_Preferences_Report', headers, rows);
    }

    if (format === 'pdf') {
      const columns = ['Order ID', 'Customer Name', 'Product Name', 'Qty & Weight', 'Customizations & Preferences'];
      const rows = data.map(d => [d.orderId, d.customerName, d.productName, `${d.qty} x ${d.weight}`, d.customizations]);
      return sendPDF(res, 'Customer_Order_Preferences_Report', 'Order Preferences & Customizations Report', 'Customer Special Instructions and Preparation Guidelines for Kitchen & Sorting Staff', columns, rows, [
        { label: 'Total Customization Items', value: `${data.length} Line Items` },
        { label: 'Special Cut Requests', value: `${data.filter(d => d.customizations !== 'Standard Farm Cut').length} Requests` }
      ]);
    }

    res.status(200).json({ data, summary: { totalItems: data.length } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating preferences report' });
  }
};

// 6. Previous Sale by Product (Historical Sales Velocity)
export const PrevoiusSalebyProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const dateFilter = getDateFilter(req);
    // Include all delivered/completed/placed orders (exclude only cancelled)
    const query = { ...dateFilter, orderStatus: { $ne: 'Cancelled' } };

    const orders = await Order.find(query);
    const products = await Product.find({}).populate('category');

    const prodInfoMap: Record<string, { category: string; stock: number; price: number }> = {};
    products.forEach(p => {
      prodInfoMap[p.name] = {
        category: (p.category as any)?.name || 'General Produce',
        stock: p.stock || 0,
        price: p.price || 0
      };
    });

    const salesMap: Record<string, { name: string; category: string; unitsSold: number; orderCount: number; revenue: number; currentStock: number }> = {};

    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const key = item.name;
        if (!salesMap[key]) {
          const info = prodInfoMap[key] || { category: 'General', stock: 0, price: item.price };
          salesMap[key] = {
            name: key,
            category: info.category,
            unitsSold: 0,
            orderCount: 0,
            revenue: 0,
            currentStock: info.stock
          };
        }
        const q = (item.quantity || (item as any).qty || 1);
        salesMap[key].unitsSold += q;
        salesMap[key].orderCount += 1;
        salesMap[key].revenue += (item.price * q);
      });
    });

    // Also include products with 0 sales if they exist in catalog
    products.forEach(p => {
      if (!salesMap[p.name]) {
        salesMap[p.name] = {
          name: p.name,
          category: (p.category as any)?.name || 'General Produce',
          unitsSold: 0,
          orderCount: 0,
          revenue: 0,
          currentStock: p.stock || 0
        };
      }
    });

    const data = Object.values(salesMap).sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold);
    const totalUnits = data.reduce((acc, d) => acc + d.unitsSold, 0);
    const totalRev = data.reduce((acc, d) => acc + d.revenue, 0);

    const format = req.query.format as string;
    if (format === 'csv') {
      const headers = ['Product Name', 'Category', 'Total Units Sold', 'Orders Count', 'Gross Revenue Generated (INR)', 'Current Stock Remaining'];
      const rows = data.map(d => [d.name, d.category, d.unitsSold, d.orderCount, `₹${d.revenue}`, d.currentStock]);
      return sendCSV(res, 'Historical_Product_Sales_Velocity', headers, rows);
    }

    if (format === 'pdf') {
      const columns = ['Product Name', 'Category', 'Units Sold', 'Orders Count', 'Gross Revenue', 'Remaining Stock'];
      const rows = data.map(d => [d.name, d.category, `${d.unitsSold} Units`, d.orderCount, `₹${d.revenue}`, `${d.currentStock} Units`]);
      return sendPDF(res, 'Historical_Product_Sales_Velocity', 'Historical Sales Velocity by Product', 'Product Revenue & Demand Analytics across Timeframe', columns, rows, [
        { label: 'Total Catalog Products Analyzed', value: `${data.length} Products` },
        { label: 'Total Units Sold in Period', value: `${totalUnits} Units` },
        { label: 'Total Gross Product Revenue', value: `₹${totalRev}` }
      ]);
    }

    res.status(200).json({ data, summary: { totalProducts: data.length, totalUnits, totalRev } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating sales report' });
  }
};

// 7. Generate Days Summary (Awaiting Fulfillment vs Incoming Harvest)
export const generateDaysSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().sort({ name: 1 });
    const activeOrders = await Order.find({
      orderStatus: { $in: ['Placed', 'Confirmed', 'Packed'] }
    });

    // Map order items by product ID
    const orderedQtyMap: { [key: string]: number } = {};
    activeOrders.forEach(o => {
      o.orderItems?.forEach(item => {
        const prodId = item.product?.toString() || item.name;
        const qty = item.quantity || (item as any).qty || 1;
        orderedQtyMap[prodId] = (orderedQtyMap[prodId] || 0) + qty;
      });
    });

    const data: any[] = [];
    let totalOrdered = 0;
    let totalStock = 0;
    let totalIncomingToday = 0;
    let totalIncomingTomorrow = 0;

    products.forEach(p => {
      const prodId = p._id.toString();
      const orderQuantity = orderedQtyMap[prodId] || 0;
      const stockOnHand = p.stock || 0;
      const poOrderedQtyForToday = (p as any).incomingToday !== undefined ? (p as any).incomingToday : 15;
      const poOrderedQtyForTomorrow = (p as any).incomingTomorrow !== undefined ? (p as any).incomingTomorrow : 25;

      const balanceAfterToday = Math.round(((stockOnHand + poOrderedQtyForToday) - orderQuantity) * 100) / 100;
      const balanceAfterTomorrow = Math.round(((stockOnHand + poOrderedQtyForToday + poOrderedQtyForTomorrow) - orderQuantity) * 100) / 100;

      totalOrdered += orderQuantity;
      totalStock += stockOnHand;
      totalIncomingToday += poOrderedQtyForToday;
      totalIncomingTomorrow += poOrderedQtyForTomorrow;

      data.push({
        id: prodId,
        name: p.name,
        unitOfSale: p.weight || '1 unit',
        orderQuantity,
        stockOnHand,
        poOrderedQtyForToday,
        balanceAfterToday,
        poOrderedQtyForTomorrow,
        balanceAfterTomorrow,
        warnToday: balanceAfterToday < 0,
        warnTomorrow: balanceAfterTomorrow < 0
      });
    });

    const format = req.query.format as string;
    if (format === 'csv') {
      const headers = [
        'Product Name',
        'Unit of Sale',
        'Customer Ordered',
        'Stock On Hand',
        'Incoming Today',
        'After Incoming Today',
        'Incoming Tomorrow',
        'After Incoming Tomorrow'
      ];
      const rows = data.map(d => [
        d.name,
        d.unitOfSale,
        d.orderQuantity,
        d.stockOnHand,
        d.poOrderedQtyForToday,
        d.balanceAfterToday,
        d.poOrderedQtyForTomorrow,
        d.balanceAfterTomorrow
      ]);
      return sendCSV(res, 'Days_Summary_Awaiting_Fulfillment', headers, rows);
    }

    if (format === 'pdf') {
      const columns = [
        'Product Name',
        'Unit',
        'Ordered',
        'Stock',
        'In Today',
        'After Today',
        'In Tomorrow',
        'After Tomorrow'
      ];
      const rows = data.map(d => [
        d.name,
        d.unitOfSale,
        `${d.orderQuantity}`,
        `${d.stockOnHand}`,
        `${d.poOrderedQtyForToday}`,
        `${d.balanceAfterToday}`,
        `${d.poOrderedQtyForTomorrow}`,
        `${d.balanceAfterTomorrow}`
      ]);
      return sendPDF(
        res,
        'Days_Summary_Awaiting_Fulfillment',
        'Days Summary: Awaiting Fulfillment',
        'Stock On Hand vs Incoming Harvest & Customer Orders Awaiting Fulfillment',
        columns,
        rows,
        [
          { label: 'Total Catalog Products', value: `${data.length} Products` },
          { label: 'Total Ordered Awaiting', value: `${totalOrdered} Units` },
          { label: 'Total Current Stock', value: `${totalStock} Units` },
          { label: 'Total Incoming Today', value: `${totalIncomingToday} Units` }
        ]
      );
    }

    res.status(200).json({
      data,
      summary: {
        totalProducts: data.length,
        totalOrdered,
        totalStock,
        totalIncomingToday,
        totalIncomingTomorrow
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating days summary' });
  }
};
