const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Patients register freely; Doctor/Admin registration restricted or defaults to PATIENT
    const userRole = role && ['PATIENT', 'DOCTOR', 'ADMIN'].includes(role) ? role : 'PATIENT';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone: phone || ''
    });

    // If registered as DOCTOR, create initial doctor profile entry
    let doctorProfile = null;
    if (userRole === 'DOCTOR') {
      doctorProfile = await Doctor.create({
        userId: user._id,
        specialization: req.body.specialization || 'General Medicine',
        department: req.body.department || 'General OPD',
        experience: req.body.experience || 1,
        consultationFee: req.body.consultationFee || 50
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorId: doctorProfile ? doctorProfile._id : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let doctorId = null;
    if (user.role === 'DOCTOR') {
      const doc = await Doctor.findOne({ userId: user._id });
      if (doc) doctorId = doc._id;
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let doctorId = null;

    if (user.role === 'DOCTOR') {
      const doc = await Doctor.findOne({ userId: user._id });
      if (doc) doctorId = doc._id;
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        doctorId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
