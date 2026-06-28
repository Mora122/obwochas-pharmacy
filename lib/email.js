// Email utility — SendGrid via HTTP API (Vercel-friendly, no SMTP port issues)
// Set SENDGRID_API_KEY in Vercel env variables for production
// Falls back to dev logging otherwise

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@obwochaspharmacy.co.ke';
const FROM_NAME = process.env.FROM_NAME || 'Obwocha\'s Pharmacy';
const SITE_URL = process.env.VERCEL_URL || 'https://obwochas-pharmacy.vercel.app';

async function sendEmail({ to, subject, html }) {
  if (!SENDGRID_API_KEY) {
    console.log('[EMAIL DEV] To:', to, 'Subject:', subject);
    console.log('[EMAIL DEV] Body:', html.substring(0, 200) + '...');
    return { success: true, devMode: true, message: 'Email logged (no API key configured)' };
  }

  try {
    const https = require('https');
    const data = JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: subject,
      content: [{ type: 'text/html', value: html }]
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.sendgrid.com',
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + SENDGRID_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true });
          } else {
            resolve({ success: false, status: res.statusCode, body });
          }
        });
      });
      req.on('error', (err) => reject(err));
      req.write(data);
      req.end();
    });
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    return { success: false, error: err.message };
  }
}

function sendResetEmail(email, resetToken) {
  const resetUrl = SITE_URL + '/reset-password.html?token=' + resetToken + '&email=' + encodeURIComponent(email);
  return sendEmail({
    to: email,
    subject: 'Reset Your Password — Obwocha\'s Pharmacy',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fff9;">
        <div style="text-align:center;padding:20px 0;">
          <h2 style="color:#1a5c2e;margin:0;">Obwocha's Pharmacy</h2>
        </div>
        <div style="background:#fff;border-radius:12px;padding:30px;border:1px solid #e0e8e0;">
          <h3 style="color:#1a5c2e;margin:0 0 12px;">Reset Your Password</h3>
          <p style="color:#555;line-height:1.6;margin:0 0 20px;">We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" style="background:#1a5c2e;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">Reset Password</a>
          </div>
          <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <p style="text-align:center;color:#999;font-size:12px;padding:20px 0;">&copy; ${new Date().getFullYear()} Obwocha's Pharmacy. All rights reserved.</p>
      </div>
    `
  });
}

function sendOrderConfirmationEmail(order, emailTo) {
  const orderUrl = SITE_URL + '/track-order.html?id=' + (order._id || order.id || order.orderId);
  const itemsHtml = (order.items || []).map(item =>
    '<tr><td style="padding:8px;border-bottom:1px solid #eee;">' + (item.name || item.productName || 'Item') + '</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">x' + (item.qty || item.quantity || 1) + '</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">KSh ' + ((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString() + '</td></tr>'
  ).join('');

  return sendEmail({
    to: emailTo || order.email || order.customerEmail,
    subject: 'Order Confirmed — #' + (order.orderId || order._id || '').toString().substring(0, 8).toUpperCase(),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fff9;">
        <div style="text-align:center;padding:20px 0;">
          <h2 style="color:#1a5c2e;margin:0;">Obwocha's Pharmacy</h2>
          <p style="color:#2e7d32;font-size:18px;margin:8px 0 0;">&#10003; Order Confirmed!</p>
        </div>
        <div style="background:#fff;border-radius:12px;padding:30px;border:1px solid #e0e8e0;">
          <p style="color:#555;line-height:1.6;">Hi ${order.name || order.customerName || 'Valued Customer'},</p>
          <p style="color:#555;line-height:1.6;">Your order has been received and is being processed.</p>
          <div style="background:#f5faf5;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0 0 4px;"><strong>Order #:</strong> ${(order.orderId || order._id || '').toString().substring(0, 8).toUpperCase()}</p>
            <p style="margin:0 0 4px;"><strong>Total:</strong> KSh ${(order.total || order.amount || 0).toLocaleString()}</p>
            <p style="margin:0 0 4px;"><strong>Delivery:</strong> ${order.delivery || 'Standard Delivery'}</p>
            <p style="margin:0;"><strong>Est. Arrival:</strong> ${order.estimatedArrival || 'Within 24 hours'}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #e0e8e0;">Item</th><th style="text-align:center;padding:8px;border-bottom:2px solid #e0e8e0;">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #e0e8e0;">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:center;margin:24px 0;">
            <a href="${orderUrl}" style="background:#1a5c2e;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">Track Your Order</a>
          </div>
        </div>
        <p style="text-align:center;color:#999;font-size:12px;padding:20px 0;">&copy; ${new Date().getFullYear()} Obwocha's Pharmacy. All rights reserved.</p>
      </div>
    `
  });
}

module.exports = { sendEmail, sendResetEmail, sendOrderConfirmationEmail, sendOrderConfirmation: sendOrderConfirmationEmail };
