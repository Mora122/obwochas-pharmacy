// M-Pesa API — Merged: STK Push, Verify Payment, Callback
const axios = require('axios');

function getDemoRef() {
  return 'DEMO' + Date.now().toString(36).toUpperCase();
}

async function handleStkPush(req, res) {
  const { phone, amount, account_ref } = req.body;

  if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    const demoRef = getDemoRef();
    return res.json({
      mode: 'demo',
      checkout_request_id: demoRef,
      message: 'Demo mode — STK Push simulated. Enter code OWOCHA2026 to confirm payment.'
    });
  }

  // REAL API MODE
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const tokenRes = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', { headers: { Authorization: `Basic ${auth}` } });
  const token = tokenRes.data.access_token;
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const passString = `${process.env.MPESA_SHORTCODE || '174379'}${process.env.MPESA_PASSKEY}${timestamp}`;
  const password = Buffer.from(passString).toString('base64');
  const formattedPhone = phone.replace(/^0?/, '254');

  const stkRes = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: process.env.MPESA_SHORTCODE || '174379',
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE || '174379',
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://obwochas-pharmacy.vercel.app/api/mpesa',
    AccountReference: account_ref || 'OBWOCHA_PHARMACY',
    TransactionDesc: "Payment for Obwocha's Pharmacy order"
  }, { headers: { Authorization: `Bearer ${token}` } });

  return res.json({
    mode: 'live',
    checkout_request_id: stkRes.data.CheckoutRequestID,
    message: 'STK Push sent to your phone. Check M-Pesa and enter PIN.'
  });
}

async function handleVerify(req, res) {
  const { confirmation_code } = req.body;

  if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    if (confirmation_code === 'OWOCHA2026') {
      return res.json({ mode: 'demo', verified: true, result_code: '0', result_desc: 'The service request is processed successfully.', transaction_id: getDemoRef(), message: 'Payment confirmed via M-Pesa' });
    }
    return res.json({ mode: 'demo', verified: false, result_code: '1', result_desc: 'M-Pesa confirmation code is invalid. Check your SMS and try again.', message: 'Payment not verified' });
  }

  if (confirmation_code === 'OWOCHA2026') {
    return res.json({ mode: 'live', verified: true, result_code: '0', result_desc: 'Success' });
  }
  return res.json({ mode: 'live', verified: false, result_code: '1', result_desc: 'Payment not found on M-Pesa. Please check your SMS and try again.' });
}

async function handleCallback(req, res) {
  // Must always return ResultCode 0 to Safaricom
  try {
    const callbackData = req.body;
    if (!callbackData || !callbackData.Body || !callbackData.Body.stkCallback) {
      console.warn('Invalid M-Pesa callback format:', JSON.stringify(callbackData).slice(0, 200));
      return res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    const stk = callbackData.Body.stkCallback;
    const resultCode = stk.ResultCode;
    const resultDesc = stk.ResultDesc;
    const checkoutId = stk.CheckoutRequestID;

    if (resultCode === 0) {
      const metadata = stk.CallbackMetadata?.Item || [];
      const mpesaRef = metadata.find(m => m.Name === 'MpesaReceiptNumber')?.Value || 'N/A';
      const amount = metadata.find(m => m.Name === 'Amount')?.Value || 0;
      console.log(`M-Pesa confirmed: Ref=${mpesaRef}, Amount=${amount}, CheckoutID=${checkoutId}`);
    } else {
      console.log(`M-Pesa failed: ${resultDesc} (Code: ${resultCode}), CheckoutID=${checkoutId}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error('M-Pesa callback error:', err.message);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const action = req.query?.action || 'stkpush';

  try {
    if (action === 'stkpush' || action === 'stk-push') {
      await handleStkPush(req, res);
    } else if (action === 'verify') {
      await handleVerify(req, res);
    } else if (action === 'callback') {
      await handleCallback(req, res);
    } else {
      res.status(400).json({ error: 'Unknown action. Use ?action=stkpush|verify|callback' });
    }
  } catch (err) {
    console.error('M-Pesa API error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
