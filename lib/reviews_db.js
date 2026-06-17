// Reviews Database Layer — MongoDB + In-Memory Fallback
const { connect } = require('./db');

/**
 * Create a new review (pending approval)
 * @param {Object} conn - DB connection
 * @param {Object} data - { name, location, rating, comment, productId?, orderId? }
 * @returns {Object} Saved review
 */
async function createReview(conn, data) {
  const review = {
    name: data.name || 'Anonymous',
    location: data.location || '',
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    comment: data.comment || '',
    productId: data.productId || '',
    orderId: data.orderId || '',
    verified: Boolean(data.verified),
    approved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (conn.mode === 'mongodb') {
    const result = await conn.db.collection('reviews').insertOne(review);
    return { ...review, _id: result.insertedId.toString() };
  }

  // In-memory fallback
  review._id = 'rev-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  if (!global.__reviews) global.__reviews = [];
  global.__reviews.push(review);
  return review;
}

/**
 * Get reviews, optionally filtered
 * @param {Object} conn - DB connection
 * @param {Object} filter - { approved?, limit?, productId? }
 * @returns {Array} Reviews
 */
async function getReviews(conn, filter = {}) {
  if (conn.mode === 'mongodb') {
    const query = {};
    if (filter.approved !== undefined) query.approved = filter.approved;
    if (filter.productId) query.productId = filter.productId;
    const opts = { sort: { createdAt: -1 } };
    if (filter.limit) opts.limit = filter.limit;
    return await conn.db.collection('reviews').find(query, opts).toArray();
  }

  let reviews = global.__reviews || [];
  if (filter.approved !== undefined) reviews = reviews.filter(r => r.approved === filter.approved);
  if (filter.productId) reviews = reviews.filter(r => r.productId === filter.productId);
  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (filter.limit) reviews = reviews.slice(0, filter.limit);
  return reviews;
}

/**
 * Approve or reject a review
 * @param {Object} conn - DB connection
 * @param {string} reviewId - Review _id
 * @param {boolean} approved - New approved status
 * @returns {Object|null} Updated review or null
 */
async function setReviewApproval(conn, reviewId, approved) {
  if (conn.mode === 'mongodb') {
    const { ObjectId } = require('mongodb');
    try {
      const result = await conn.db.collection('reviews').findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        { $set: { approved: Boolean(approved), updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      return result;
    } catch {
      return null;
    }
  }

  const idx = (global.__reviews || []).findIndex(r => r._id === reviewId);
  if (idx === -1) return null;
  global.__reviews[idx].approved = Boolean(approved);
  global.__reviews[idx].updatedAt = new Date().toISOString();
  return global.__reviews[idx];
}

/**
 * Delete a review
 * @param {Object} conn - DB connection
 * @param {string} reviewId - Review _id
 * @returns {boolean} True if deleted
 */
async function deleteReview(conn, reviewId) {
  if (conn.mode === 'mongodb') {
    const { ObjectId } = require('mongodb');
    try {
      const result = await conn.db.collection('reviews').deleteOne({ _id: new ObjectId(reviewId) });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }

  const len = (global.__reviews || []).length;
  global.__reviews = (global.__reviews || []).filter(r => r._id !== reviewId);
  return global.__reviews.length < len;
}

module.exports = { createReview, getReviews, setReviewApproval, deleteReview };
