const express = require('express');
const router = express.Router();
const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public (viewable by everyone, even logged-out visitors on the Home page)
router.get('/', optionalAuth, getOffers);
router.get('/:id', optionalAuth, getOfferById);

// Admin + Employee can create/update
router.post('/', protect, authorize('admin', 'employee'), createOffer);
router.put('/:id', protect, authorize('admin', 'employee'), updateOffer);

// Admin only can delete
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router;
