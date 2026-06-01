// M-Pesa Callback — Vercel serverless function (receives webhook from Safaricom)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const callbackData = req.body;
    console.log('M-Pesa callback received:', JSON.stringify(callbackData));

    const resultCode = callbackData?.Body?.stkCallback?.ResultCode;
    const resultDesc = callbackData?.Body?.stkCallback?.ResultDesc;
    const checkoutId = callbackData?.Body?.stkCallback?.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment successful
      const metadata = callbackData.Body.stkCallback.CallbackMetadata?.Item || [];
      const ref = metadata.find(m => m.Name === 'MpesaReceiptNumber')?.Value || 'N/A';
      console.log(`✅ M-Pesa payment confirmed. Ref: ${ref}, CheckoutID: ${checkoutId}`);
    } else {
      console.log(`❌ M-Pesa payment failed: ${resultDesc}`);
    }

    // Must respond with 0 Success for Safaricom
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (err) {
    console.error('M-Pesa callback error:', err.message);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
};
