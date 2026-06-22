// Email notification helper for Obwocha's Pharmacy
// Uses Nodemailer + SMTP (configurable via env vars)

const nodemailer = require('nodemailer');

// Get SMTP config from environment variables (set in Vercel)
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If no SMTP configured, return null — email will be stored in DB only
  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

function getFromAddress() {
  return process.env.SMTP_FROM || 'noreply@obwochaspharmacy.co.ke';
}

// Store notification in MongoDB order timeline
async function storeNotification(order, event, message) {
  try {
    const { connect } = require('./db');
    const conn = await connect();
    const col = conn.mode === 'mongodb' ? conn.db.collection('orders') : null;
    if (!col) return;
    const id = order._id || order.id;
    if (id) {
      await col.updateOne(
        { _id: id },
        { $push: { timeline: { event, message, timestamp: new Date().toISOString() } } }
      );
    }
  } catch (e) {
    console.error('[EMAIL] Error storing notification:', e.message);
  }
}

// Build HTML order confirmation email
function buildOrderConfirmationHtml(order, customerName) {
  const items = (order.items || []).map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name || item.productName || 'Product'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">x${item.quantity || 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">KSh ${(item.price || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const subtotal = order.amount || order.total || 0;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr>
        <td style="background:#1b5e20;padding:20px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Obwocha's Pharmacy</h1>
          <p style="color:#a5d6a7;margin:5px 0 0;">Order Confirmation</p>
        </td>
      </tr>
      <tr><td style="padding:20px;">
        <p>Hi <strong>${customerName || 'Valued Customer'}</strong>,</p>
        <p>Thank you for your order! Your order has been received and is being processed.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:4px;padding:12px;margin:10px 0;">
          <tr>
            <td style="font-size:14px;color:#666;">Order #</td>
            <td style="text-align:right;font-weight:bold;">${order.id || order._id || 'N/A'}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#666;">Date</td>
            <td style="text-align:right;">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#666;">Status</td>
            <td style="text-align:right;text-transform:capitalize;">${order.status || 'pending'}</td>
          </tr>
        </table>
        <h3 style="margin:20px 0 10px;">Order Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="background:#1b5e20;color:#fff;">
              <th style="padding:8px;text-align:left;">Item</th>
              <th style="padding:8px;text-align:center;">Qty</th>
              <th style="padding:8px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${items || '<tr><td colspan="3" style="padding:8px;text-align:center;color:#999;">No items</td></tr>'}
          </tbody>
        </table>
        <hr style="border:none;border-top:2px solid #1b5e20;">
        <table width="100%">
          <tr>
            <td style="font-size:18px;font-weight:bold;">Total</td>
            <td style="text-align:right;font-size:18px;font-weight:bold;">KSh ${subtotal.toLocaleString()}</td>
          </tr>
        </table>
        <p style="margin-top:20px;color:#666;font-size:14px;">You can track your order status by logging into your account.</p>
        <p style="color:#666;font-size:14px;">If you have any questions, reply to this email or contact us.</p>
      </td></tr>
      <tr>
        <td style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#999;">
          Obwocha's Pharmacy &bull; Nairobi, Kenya<br>
          <a href="https://obwochas-pharmacy.vercel.app" style="color:#1b5e20;">obwochas-pharmacy.vercel.app</a>
        </td>
      </tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

// Build HTML status update email
function buildStatusUpdateHtml(order, newStatus, customerName) {
  const statusEmojis = {
    pending: '⏳',
    processing: '⚙️',
    shipped: '🚚',
    delivered: '✅',
    cancelled: '❌'
  };
  const emoji = statusEmojis[newStatus] || '📋';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr>
        <td style="background:#1b5e20;padding:20px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Obwocha's Pharmacy</h1>
          <p style="color:#a5d6a7;margin:5px 0 0;">Order Update</p>
        </td>
      </tr>
      <tr><td style="padding:20px;">
        <p>Hi <strong>${customerName || 'Valued Customer'}</strong>,</p>
        <p style="font-size:18px;">${emoji} Your order <strong>#${order.id || order._id || 'N/A'}</strong> has been updated to: <strong style="text-transform:capitalize;color:#1b5e20;">${newStatus}</strong></p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:4px;padding:12px;margin:10px 0;">
          <tr>
            <td style="font-size:14px;color:#666;">Order #</td>
            <td style="text-align:right;font-weight:bold;">${order.id || order._id || 'N/A'}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#666;">Status</td>
            <td style="text-align:right;text-transform:capitalize;font-weight:bold;color:#1b5e20;">${newStatus}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#666;">Total</td>
            <td style="text-align:right;">KSh ${(order.amount || order.total || 0).toLocaleString()}</td>
          </tr>
        </table>
        <p style="color:#666;font-size:14px;">Log into your account to view full order details.</p>
      </td></tr>
      <tr>
        <td style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#999;">
          Obwocha's Pharmacy &bull; Nairobi, Kenya<br>
          <a href="https://obwochas-pharmacy.vercel.app" style="color:#1b5e20;">obwochas-pharmacy.vercel.app</a>
        </td>
      </tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

async function sendEmail(to, subject, html) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL] SMTP not configured. Would send to ${to}: "${subject}"`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Obwocha's Pharmacy" <${getFromAddress()}>`,
      to,
      subject,
      html
    });
    console.log(`[EMAIL] Sent to ${to}: "${subject}" (id: ${info.messageId})`);
    return true;
  } catch (e) {
    console.error(`[EMAIL] Failed to send to ${to}:`, e.message);
    return false;
  }
}

async function sendOrderConfirmation(order, customerEmail) {
  const customerName = order.customerName || order.customer?.name || order.name || 'Valued Customer';
  const html = buildOrderConfirmationHtml(order, customerName);

  await sendEmail(customerEmail, `Order Confirmation — #${order.id || order._id}`, html);
  await storeNotification(order, 'order_confirmation_email', `Order confirmation sent to ${customerEmail}`);
}

async function sendStatusUpdate(order, newStatus, customerEmail) {
  const customerName = order.customerName || order.customer?.name || order.name || 'Valued Customer';
  const html = buildStatusUpdateHtml(order, newStatus, customerName);

  await sendEmail(customerEmail, `Order Update — #${order.id || order._id} is now ${newStatus}`, html);
  await storeNotification(order, 'status_update_email', `Status update (${newStatus}) sent to ${customerEmail}`);
}

module.exports = { sendOrderConfirmation, sendStatusUpdate };
