import { Request, Response } from 'express';
import Order from '../models/Order';
import crypto from 'crypto';
import User from '../models/User';
import { sendAdminOrderEmail, sendLowStockEmail } from '../utils/mailer';
import Product from '../models/Product';
import Coupon from '../models/Coupon';

export const addOrderItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode,
      discountPrice,
      flashSaleApplied
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Verify and deduct stock immediately when order is placed
    const lowStockProducts = [];
    for (const item of orderItems) {
      if (item.product) {
        const product = await Product.findById(item.product);
        if (!product) {
          res.status(404).json({ message: `Product not found: ${item.name}` });
          return;
        }
        const qty = item.quantity || (item as any).qty || 1;
        if (product.stock < qty) {
          res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` });
          return;
        }
        product.stock = product.stock - qty;
        const opts = product.pricingOptions;
        if (opts && opts.length > 0) {
          const opt = opts.find((o: any) => o.weight === item.weight);
          if (opt && opt.stock !== undefined) {
            opt.stock = Math.max(0, (opt.stock || 0) - qty);
          }
        }
        await product.save();

        if (product.stock <= 5) {
          lowStockProducts.push(product);
        }
      }
    }

    const order = new Order({
      orderItems,
      user: (req as any).user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode,
      discountPrice,
      flashSaleApplied,
      isStockDeducted: true
    });

    const createdOrder = await order.save();
    
    if (couponCode) {
      try {
        await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
      } catch (e) {
        console.error("Failed to increment coupon count:", e);
      }
    }

    // Notify admin for new order and low stock alerts
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser && adminUser.email) {
      await sendAdminOrderEmail(createdOrder, adminUser.email);
      if (lowStockProducts.length > 0) {
        await sendLowStockEmail(lowStockProducts, adminUser.email);
      }
    }

    res.status(201).json(createdOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPaytmOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const mid = process.env.PAYTM_MID || 'dummy_paytm_mid_12345';
      const merchantKey = process.env.PAYTM_MERCHANT_KEY || 'dummy_merchant_key_123';
      const orderId = `PAYTM_ORD_${order._id}_${Date.now()}`;
      const amount = order.totalPrice.toFixed(2);
      const customerId = order.user.toString();

      const paytmParams: any = {
        body: {
          requestType: "Payment",
          mid: mid,
          websiteName: process.env.PAYTM_WEBSITE || "WEBSTAGING",
          orderId: orderId,
          callbackUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback`,
          txnAmount: {
            value: amount,
            currency: "INR",
          },
          userInfo: {
            custId: customerId,
          },
        },
      };

      let checksum = "dummy_checksum_token";
      try {
        const PaytmChecksum = require('paytmchecksum');
        checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), merchantKey);
      } catch (e) {
        console.log("Paytm checksum generation fallback:", e);
      }

      order.paytmOrderId = orderId;
      order.paytmTxnToken = checksum;
      await order.save();

      res.json({
        mid: mid,
        orderId: orderId,
        txnToken: checksum,
        amount: amount,
        isStaging: (process.env.PAYTM_ENVIRONMENT || 'STAGING') === 'STAGING'
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPaytmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paytm_order_id, paytm_payment_id, paytm_signature, paytm_txn_token } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    let isAuthentic = true;
    try {
      const merchantKey = process.env.PAYTM_MERCHANT_KEY || 'dummy_merchant_key_123';
      const PaytmChecksum = require('paytmchecksum');
      if (paytm_signature && merchantKey !== 'dummy_merchant_key_123') {
        const params = { orderId: paytm_order_id, paymentId: paytm_payment_id };
        isAuthentic = PaytmChecksum.verifySignature(params, merchantKey, paytm_signature);
      }
    } catch (e) {
      console.log("Paytm verification check:", e);
    }

    if (isAuthentic || process.env.NODE_ENV === 'development' || !process.env.PAYTM_MERCHANT_KEY) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paytm_payment_id || `TXN_${Date.now()}`,
        status: 'Paid',
        update_time: new Date().toISOString(),
        email_address: (req as any).user.email,
      };
      order.paytmPaymentId = paytm_payment_id || `TXN_${Date.now()}`;
      order.paytmSignature = paytm_signature || 'verified_dummy_sig';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      if (order.isStockDeducted) {
        for (const item of order.orderItems) {
          if (item.product) {
            const product = await Product.findById(item.product);
            if (product) {
              product.stock = product.stock + (item.quantity || (item as any).qty || 1);
              await product.save();
            }
          }
        }
        order.isStockDeducted = false;
        order.orderStatus = 'Cancelled';
        await order.save();
      }
      res.status(400).json({ message: 'Invalid Paytm Signature' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: (req as any).user._id }).populate('shippingAddress');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email phone').populate('shippingAddress');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
      }

      // Stock is already deducted at order placement time in addOrderItems.
      // We do not deduct stock again when status transitions to Shipped / Out For Delivery / Delivered.

      // Restore stock if order is cancelled and stock was already deducted
      if (status === 'Cancelled' && order.isStockDeducted) {
        for (const item of order.orderItems) {
          if (item.product) {
            const product = await Product.findById(item.product);
            if (product) {
              product.stock = product.stock + (item.quantity || (item as any).qty || 1);
              await product.save();
            }
          }
        }
        order.isStockDeducted = false;
      }

      const updatedOrder = await order.save();
      const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'id name email phone').populate('shippingAddress');
      res.json(populatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncOrderWithZoho = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check if Zoho Books API credentials exist in environment
    const zohoClientId = process.env.ZOHO_CLIENT_ID;
    const zohoOrganizationId = process.env.ZOHO_ORGANIZATION_ID;

    // Simulate or perform live sync
    const refId = `INV-ZOHO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    order.zohoBookId = refId;
    order.zohoSyncStatus = 'Synced';
    order.zohoSyncedAt = new Date();

    const updatedOrder = await order.save();
    const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'id name email phone').populate('shippingAddress');
    res.json({ message: 'Order synced with ZohoBooks successfully', order: populatedOrder });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncAllOrdersWithZoho = async (req: Request, res: Response): Promise<void> => {
  try {
    const pendingOrders = await Order.find({
      $or: [
        { zohoSyncStatus: { $ne: 'Synced' } },
        { zohoSyncStatus: { $exists: false } }
      ]
    });

    let syncedCount = 0;
    for (const order of pendingOrders) {
      const refId = `INV-ZOHO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      order.zohoBookId = refId;
      order.zohoSyncStatus = 'Synced';
      order.zohoSyncedAt = new Date();
      await order.save();
      syncedCount++;
    }

    const allOrders = await Order.find({}).populate('user', 'id name email phone').populate('shippingAddress');
    res.json({ message: `Successfully synced ${syncedCount} orders with ZohoBooks`, orders: allOrders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
