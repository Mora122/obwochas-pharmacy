// M-Pesa STK Push — Vercel serverless function
const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { phone, amount, account_ref } = req.body;

    if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      // DEMO MODE
      const demoRef = 'DEMO' + Date.now().toString(36).toUpperCase();
      return res.json({
        mode: 'demo',
        checkout_request_id: demoRef,
        message: 'Demo mode — STK Push simulated. Enter code OWOCHA2026 to confirm payment.'
      });
    }

    // REAL API MODE
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const tokenRes = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const token = tokenRes.data.access_token;

    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const passString = `${process.env.MPESA_SHORTCODE || '174379'}${process.env.MPESA_PASSKEY}${timestamp}`;
    const password = Buffer.from(passString).toString('base64');
    const formattedPhone = phone.replace(/^0?/, '254');

    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE || '174379',
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE || '174379',
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://goodlife-replica.vercel.app/api/mpesa-callback',
        AccountReference: account_ref || 'OBWOCHA_PHARMACY',
        TransactionDesc: 'Payment for Obwocha\'s Pharmacy order'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      mode: 'live',
      checkout_request_id: stkRes.data.CheckoutRequestID,
      message: 'STK Push sent to your phone. Check M-Pesa and enter PIN.'
    });

  } catch (err) {
    console.error('M-Pesa error:', err.response?.data || err.message);
    const demoRef = 'DEMO' + Date.now().toString(36).toUpperCase();
    res.json({
      mode: 'demo',
      checkout_request_id: demoRef,
      message: 'Demo fallback — Enter code OWOCHA2026 to confirm payment.'
    });
  }
};
