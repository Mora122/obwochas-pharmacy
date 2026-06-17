// M-Pesa Callback — Receives webhook from Safaricom after STK push
// SECURITY: Verifies callback structure matches expected Safaricom format
// Logs requesting IP for audit trail
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ResultCode: 1, ResultDesc: 'Method not allowed' });
  }

  try {
    const callbackData = req.body;

    // Validate callback structure (must match Safaricom's format)
    if (!callbackData || !callbackData.Body || !callbackData.Body.stkCallback) {
      console.warn('⚠️ Invalid M-Pesa callback format (missing Body.stkCallback):', 
        JSON.stringify(callbackData).slice(0, 200));
      // Still return success to Safaricom (they'll retry otherwise)
      return res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    const stk = callbackData.Body.stkCallback;
    const resultCode = stk.ResultCode;
    const resultDesc = stk.ResultDesc;
    const checkoutId = stk.CheckoutRequestID;
    const merchantId = stk.MerchantRequestID;

    // Log source IP for audit (Vercel proxy forwards it)
    const sourceIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';

    if (resultCode === 0) {
      // Payment successful
      const metadata = stk.CallbackMetadata?.Item || [];
      const mpesaRef = metadata.find(m => m.Name === 'MpesaReceiptNumber')?.Value || 'N/A';
      const phone = metadata.find(m => m.Name === 'PhoneNumber')?.Value || 'N/A';
      const amount = metadata.find(m => m.Name === 'Amount')?.Value || 0;
      
      console.log(`✅ M-Pesa payment confirmed. Ref: ${mpesaRef}, Amount: ${amount}, Phone: ${phone}, CheckoutID: ${checkoutId}, From: ${sourceIp}`);
    } else {
      console.log(`❌ M-Pesa payment failed: ${resultDesc} (Code: ${resultCode}), CheckoutID: ${checkoutId}, From: ${sourceIp}`);
    }

    // Must respond with ResultCode 0 for Safaricom (even on failures in our system)
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (err) {
    console.error('M-Pesa callback error:', err.message);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
};
