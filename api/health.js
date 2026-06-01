// Health check — Vercel serverless function
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const mpesaReady = !!(process.env.MPESA_CONSUMER_KEY && 
    process.env.MPESA_CONSUMER_KEY !== 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const stripeReady = !!process.env.STRIPE_SECRET_KEY;

  res.json({
    status: 'ok',
    mode: 'vercel-serverless',
    stripe: stripeReady,
    mpesa: mpesaReady,
    timestamp: new Date().toISOString()
  });
};
