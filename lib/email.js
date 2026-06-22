// Email notification helper for Obwocha's Pharmacy
// Uses Vercel's built-in ability + stores notifications in MongoDB/order timeline

async function sendOrderConfirmation(order, customerEmail) {
  // For now, store the notification in the orders collection
  // and rely on the admin seeing new orders in the dashboard
  // This will be replaced with actual SMTP when credentials are available
  console.log(`[EMAIL] Order confirmation for ${customerEmail}: Order #${order.id || order._id}`);
  try {
    const { connect } = require('./db');
    const conn = await connect();
    const col = conn.mode === 'mongodb'
      ? conn.db.collection('orders')
      : null;
    if (!col) {
      console.warn('[EMAIL] No database available, notification stored in console only');
      return;
    }
    await col.updateOne(
      { _id: order._id || order.id },
      { $set: {
        'notifications.orderConfirmationSent': true,
        'notifications.orderConfirmationAt': new Date().toISOString()
      },
        $push: {
          timeline: {
            event: 'order_confirmation_email',
            message: `Order confirmation notification for ${customerEmail}`,
            timestamp: new Date().toISOString()
          }
        }
      }
    );
  } catch(e) {
    console.error('[EMAIL] Error storing notification:', e);
  }
}

async function sendStatusUpdate(order, newStatus, customerEmail) {
  console.log(`[EMAIL] Status update for ${customerEmail}: Order #${order.id || order._id} → ${newStatus}`);
  try {
    const { connect } = require('./db');
    const conn = await connect();
    const col = conn.mode === 'mongodb'
      ? conn.db.collection('orders')
      : null;
    if (!col) {
      console.warn('[EMAIL] No database available, status update logged only');
      return;
    }
    await col.updateOne(
      { _id: order._id || order.id },
      { $push: {
          timeline: {
            event: 'status_update_notification',
            message: `Status changed to: ${newStatus}. Notification for ${customerEmail}`,
            timestamp: new Date().toISOString()
          }
        }
      }
    );
  } catch(e) {
    console.error('[EMAIL] Error storing status notification:', e);
  }
}

module.exports = { sendOrderConfirmation, sendStatusUpdate };
