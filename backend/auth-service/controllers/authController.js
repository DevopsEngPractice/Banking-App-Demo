const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  accountNumber: user.accountNumber,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// @route  POST /api/auth/register
// @desc   Register a new end user (public). Admin/Employee accounts are created by an admin.
exports.register = async (req, res) => {

    console.log("========== REGISTER ==========");
    console.log(req.body);

  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    console.log("Existing User :", existingUser);
    console.log("Creating user...");


    const user = await User.create({ name, email, password, phone, role: 'user' });
    console.log("User Created");
    const token = signToken(user);
    console.log("JWT Generated");

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR");
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// @route  POST /api/auth/login
// @desc   Login for admin, employee and user roles
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact the bank.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// @route  GET /api/auth/me
// @desc   Get current logged in user's profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/auth/me
// @desc   Update own profile (name / phone only)
exports.updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { ...(name && { name }), ...(phone !== undefined && { phone }) } },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Profile updated', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  GET /api/auth/users
// @desc   Admin: list all users (optionally filter by role)
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users: users.map(sanitizeUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  POST /api/auth/users
// @desc   Admin: create a user with any role (admin/employee/user)
exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: ['admin', 'employee', 'user'].includes(role) ? role : 'user',
    });
    res.status(201).json({ success: true, message: 'User created', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/auth/users/:id
// @desc   Admin: update a user's role / active status / details
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (role !== undefined && ['admin', 'employee', 'user'].includes(role)) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User updated', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/auth/users/:id
// @desc   Admin: delete a user
exports.deleteUserByAdmin = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  GET /api/auth/verify
// @desc   Internal helper other microservices could call to verify a token (optional use)
exports.verifyToken = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
