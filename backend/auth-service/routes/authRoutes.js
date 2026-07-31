const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  verifyToken,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Authenticated user routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/verify', protect, verifyToken);

// Admin-only user management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.post('/users', protect, authorize('admin'), createUserByAdmin);
router.put('/users/:id', protect, authorize('admin'), updateUserByAdmin);
router.delete('/users/:id', protect, authorize('admin'), deleteUserByAdmin);

module.exports = router;
