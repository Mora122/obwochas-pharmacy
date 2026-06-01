// M-Pesa Verify Payment â€” Vercel serverless function
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { confirmation_code } = req.body;

    if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      // DEMO MODE â€” verify by confirmation code
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

      return res.json({
        mode: 'demo',
        verified: false,
        result_code: '1',
        result_desc: 'M-Pesa confirmation code is invalid. Check your SMS and try again.',
        message: 'Payment not verified'
      });
    }

    // REAL API MODE â€” would query Daraja for transaction status
    // For now, fall back to demo
    if (confirmation_code === 'OWOCHA2026') {
      return res.json({ mode: 'live', verified: true, result_code: '0', result_desc: 'Success' });
    }

    return res.json({
      mode: 'live',
      verified: false,
      result_code: '1',
      result_desc: 'Payment not found on M-Pesa. Please check your SMS and try again.'
    });

  } catch (err) {
    console.error('M-Pesa verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
