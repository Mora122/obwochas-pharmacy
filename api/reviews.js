// Reviews API — GET /api/reviews, POST /api/reviews, PATCH /api/reviews, DELETE /api/reviews
// GET is public (approved only); POST is public (submit); PATCH/DELETE require admin JWT
const { connect } = require('../lib/db');
const reviewsDb = require('../lib/reviews_db');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const conn = await connect();

    // GET — Approved reviews (PUBLIC) or all reviews (ADMIN with ?all=true)
    if (req.method === 'GET') {
      if (req.query.all === 'true') {
        // Admin view — requires JWT
        const user = requireAdmin(req, res);
        if (!user) return;
        const reviews = await reviewsDb.getReviews(conn, { limit: parseInt(req.query.limit) || 200 });
        return res.json({ success: true, count: reviews.length, reviews });
      }

      // Public — only approved reviews
      const limit = parseInt(req.query.limit) || 50;
      const filter = { approved: true, limit };
      if (req.query.productId) filter.productId = req.query.productId;
      const reviews = await reviewsDb.getReviews(conn, filter);
      return res.json({ success: true, count: reviews.length, reviews });
    }

    // POST — Submit a new review (PUBLIC)
    if (req.method === 'POST') {
      const { name, location, rating, comment, productId, orderId } = req.body || {};

      if (!comment || comment.trim().length < 10) {
        return res.status(400).json({ success: false, error: 'Review must be at least 10 characters' });
      }
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Name is required' });
      }

      const review = await reviewsDb.createReview(conn, {
        name: name.trim(),
        location: (location || '').trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        comment: comment.trim(),
        productId: productId || '',
        orderId: orderId || '',
        verified: false
      });

      return res.json({ success: true, review, message: 'Thank you! Your review is pending approval.' });
    }

    // PATCH — Approve or reject a review (ADMIN ONLY)
    if (req.method === 'PATCH') {
      const user = requireAdmin(req, res);
      if (!user) return;

      const { reviewId, approved } = req.body || {};
      if (!reviewId) {
        return res.status(400).json({ success: false, error: 'reviewId required' });
      }

      const review = await reviewsDb.setReviewApproval(conn, reviewId, approved);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      return res.json({ success: true, review });
    }

    // DELETE — Delete a review (ADMIN ONLY)
    if (req.method === 'DELETE') {
      const user = requireAdmin(req, res);
      if (!user) return;

      const reviewId = req.query.id || req.query.reviewId;
      if (!reviewId) {
        return res.status(400).json({ success: false, error: 'Review ID required' });
      }

      const deleted = await reviewsDb.deleteReview(conn, reviewId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('Reviews API error:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
};
