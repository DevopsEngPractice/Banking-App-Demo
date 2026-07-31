const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getServices);
router.get('/:id', optionalAuth, getServiceById);

router.post('/', protect, authorize('admin', 'employee'), createService);
router.put('/:id', protect, authorize('admin', 'employee'), updateService);

router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
