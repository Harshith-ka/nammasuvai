import nodemailer from 'nodemailer';

export const verifyEmailConfig = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER.includes('dummy')) {
    console.log(`[Email Notice] ⚠️ SMTP credentials (SMTP_USER/SMTP_PASS) not configured in .env. Email sending will run in MOCK mode.`);
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log(`[Email Service] ✅ SMTP connection verified successfully! Live email sending is READY.`);
    return true;
  } catch (err: any) {
    console.warn(`[Email Notice] ⚠️ Failed to connect to SMTP server: ${err.message}. Email sending will fallback to MOCK mode.`);
    return false;
  }
};

export const sendAdminOrderEmail = async (order: any, adminEmail: string) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER.includes('dummy')) {
      console.log(`[Email Mock] 📨 Would send New Order Email to Admin (${adminEmail}) for Order ID: ${order._id} (Total: ₹${order.totalPrice})`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"NammaSuvai Orders" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Order Received - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1A4027;">New Order Placed! 🎉</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <h3 style="margin-top: 20px;">Order Items:</h3>
          <ul>
            ${order.orderItems.map((item: any) => `<li>${item.name} (x${item.quantity}) - ₹${item.price}</li>`).join('')}
          </ul>
          <p style="margin-top: 20px; color: #666;">Please check the admin dashboard for full dispatch details.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] ✅ Order notification email sent to admin: ${adminEmail}`);
  } catch (error: any) {
    console.error('[Email Error] ❌ Error sending admin order email:', error.message);
  }
};

export const sendLowStockEmail = async (products: any[], adminEmail: string) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER.includes('dummy')) {
      console.log(`[Email Mock] 🚨 Would send Low Stock Alert Email to Admin (${adminEmail}) for ${products.length} product(s).`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"NammaSuvai Alerts" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🚨 Low Stock Alert!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #c0392b;">🚨 Low Stock Alert</h2>
          <p>The following products are running low on stock and need to be replenished immediately:</p>
          <ul>
            ${products.map((p: any) => `<li><strong>${p.name}</strong> - Only <span style="color: red; font-weight: bold;">${p.stock}</span> left!</li>`).join('')}
          </ul>
          <p style="margin-top: 20px;">Please update the inventory in your admin console.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] ✅ Low stock alert email sent to admin: ${adminEmail}`);
  } catch (error: any) {
    console.error('[Email Error] ❌ Error sending low stock email:', error.message);
  }
};
