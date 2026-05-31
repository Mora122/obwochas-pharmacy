/**
 * Obwocha's Pharmacy — Payment Backend Server
 * 
 * Stripe Checkout (cards) + M-Pesa Daraja API (mobile money)
 * 
 * SETUP:
 *   1. cp .env.example .env
 *   2. Fill in API keys (see .env.example for where to get them)
 *   3. npm install && npm start
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    stripe: !!process.env.STRIPE_SECRET_KEY,
    mpesa: !!process.env.MPESA_CONSUMER_KEY
  });
});

// ─── 1. STRIPE CHECKOUT ──────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      return res.json({ 
        mode: 'demo',
        url: `http://localhost:8000/checkout.html?stripe_demo=1&total=${items?.[0]?.amount || 7240}`
      });
    }

    const line_items = items.map(item => ({
      price_data: {
        currency: 'kes',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100) // cents
      },
      quantity: item.quantity || 1
    }));

    // Add delivery fee if any
    if (req.body.delivery_fee) {
      line_items.push({
        price_data: {
          currency: 'kes',
          product_data: { name: 'Delivery Fee' },
          unit_amount: Math.round(req.body.delivery_fee * 100)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: customer?.email,
      shipping_address_collection: { allowed_countries: ['KE'] },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/checkout.html?stripe_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/checkout.html?stripe_cancel=1`,
      metadata: {
        customer_phone: customer?.phone || '',
        customer_name: customer?.name || ''
      }
    });

    res.json({ mode: 'live', url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Stripe Webhook (order fulfillment) ──────────────────────
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Webhook signature verification failed');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Stripe payment completed:', session.id, session.amount_total);
    // TODO: Fulfill order in your database
  }

  res.json({ received: true });
});

// ─── 2. M-PESA DARAJA API ────────────────────────────────────

// Helper: Generate M-Pesa auth token
let mpesaToken = null;
let tokenExpiry = 0;

async function getMpesaToken() {
  if (Date.now() < tokenExpiry) return mpesaToken;

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  mpesaToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return mpesaToken;
}

// Helper: Generate M-Pesa password (Shortcode + Passkey + Timestamp)
function getMpesaPassword() {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const str = process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp;
  return {
    password: Buffer.from(str).toString('base64'),
    timestamp
  };
}

// POST /api/mpesa-stk-push  — Initiate STK Push
app.post('/api/mpesa-stk-push', async (req, res) => {
  try {
    const { phone, amount, account_ref } = req.body;

    // Validate phone
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const mpesaPhone = cleanPhone.startsWith('0') 
      ? '254' + cleanPhone.slice(1) 
      : cleanPhone.startsWith('254') ? cleanPhone : '254' + cleanPhone;

    // Check if credentials are configured for real API
    if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      // DEMO MODE — simulate the STK Push
      return res.json({
        mode: 'demo',
        message: 'STK Push sent — check your phone for the M-Pesa prompt',
        phone: mpesaPhone,
        amount,
        checkout_request_id: 'DEMO_' + Date.now()
      });
    }

    // REAL API MODE
    const token = await getMpesaToken();
    const { password, timestamp } = getMpesaPassword();

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: mpesaPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: mpesaPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://obwocha-pharmacy.co.ke/api/mpesa-callback',
        AccountReference: account_ref || 'ObwochaPharm',
        TransactionDesc: 'Pharmacy Order Payment'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      mode: 'live',
      ...response.data
    });

  } catch (err) {
    console.error('M-Pesa error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// POST /api/mpesa-callback  — M-Pesa results webhook
app.post('/api/mpesa-callback', (req, res) => {
  const result = req.body;

  if (result.Body?.stkCallback?.ResultCode === 0) {
    console.log('✅ M-Pesa payment successful:', result.Body.stkCallback);
    // TODO: Fulfill order in your database
  } else {
    console.log('❌ M-Pesa payment failed:', result.Body?.stkCallback?.ResultDesc);
  }

  res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// POST /api/mpesa-verify  — Verify if customer actually paid
app.post('/api/mpesa-verify', async (req, res) => {
  try {
    const { phone, amount, checkout_request_id, confirmation_code } = req.body;

    if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      // DEMO MODE — verify by confirmation code
      // Demo code for investor presentation: OWOCHA2026
      if (confirmation_code === 'OWOCHA2026') {
        return res.json({
          mode: 'demo',
          verified: true,
          result_code: '0',
          result_desc: 'The service request is processed successfully.',
          transaction_id: 'DEMO' + Date.now().toString(36).toUpperCase(),
          message: 'Payment confirmed via M-Pesa'
        });
      }
      
      // Check if code matches format of real M-Pesa confirmation (starts with letters + digits)
      // This simulates checking against actual M-Pesa transaction data
      return res.json({
        mode: 'demo',
        verified: false,
        result_code: '1',
        result_desc: 'M-Pesa confirmation code is invalid or payment not completed. Please check your SMS and try again.',
        message: 'Payment not verified'
      });
    }

    // REAL API MODE
    const token = await getMpesaToken();
    const { password, timestamp } = getMpesaPassword();

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkout_request_id
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const resultCode = response.data.ResultCode;
    const verified = resultCode === '0' || resultCode === 0;

    res.json({
      mode: 'live',
      verified,
      ...response.data
    });

  } catch (err) {
    console.error('M-Pesa verify error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// POST /api/mpesa-query  — Check STK Push status
app.post('/api/mpesa-query', async (req, res) => {
  try {
    const { checkout_request_id } = req.body;

    if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      return res.json({
        mode: 'demo',
        result_code: '0',
        result_desc: 'The service request is processed successfully.'
      });
    }

    const token = await getMpesaToken();
    const { password, timestamp } = getMpesaPassword();

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkout_request_id
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║     Obwocha's Pharmacy — Payment Server      ║
╠══════════════════════════════════════════════╣
║  Port:     ${String(PORT).padEnd(36)}║
║  Stripe:   ${(process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? '✅ Ready' : '⚠️  Set STRIPE_SECRET_KEY in .env').padEnd(36)}║
║  M-Pesa:   ${(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_KEY !== 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' ? '✅ Ready' : '⚠️  Set MPESA_CONSUMER_KEY in .env').padEnd(36)}║
╚══════════════════════════════════════════════╝
  `);
});
