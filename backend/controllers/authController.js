const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Helper function to find user in mock mode
const findUserInMock = (email) => {
  if (!global.MOCK_MODE || !global.MOCK_USERS) return null;
  return global.MOCK_USERS.find(u => u.email === email);
};

// Helper function to find user by ID in mock mode
const findUserByIdInMock = (id) => {
  if (!global.MOCK_MODE || !global.MOCK_USERS) return null;
  return global.MOCK_USERS.find(u => u._id.toString() === id.toString());
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user;
    if (global.MOCK_MODE) {
      user = findUserInMock(email);
    } else {
      user = await User.findOne({ email });
    }

    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with that email',
      });
    }

    if (global.MOCK_MODE) {
      // In mock mode, manually create user
      const hashedPassword = await bcryptjs.hash(password, 10);
      const newUser = {
        _id: new (require('mongoose').Types.ObjectId)(),
        name,
        email,
        password: hashedPassword,
        role: 'user',
        consentGiven: false,
        consentDate: null,
        createdAt: new Date(),
        __v: 0
      };
      global.MOCK_USERS.push(newUser);
      user = newUser;
    } else {
      // Create new user via Mongoose
      user = new User({
        name,
        email,
        password,
        role: 'user',
      });
      await user.save();
    }

    // Create JWT token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Check for user
    let user;
    if (global.MOCK_MODE) {
      user = findUserInMock(email);
    } else {
      user = await User.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    let user;
    if (global.MOCK_MODE) {
      user = findUserByIdInMock(req.userId);
    } else {
      user = await User.findById(req.userId);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

exports.recordConsent = async (req, res) => {
  try {
    const { consented, consentDate } = req.body;

    if (consented !== true) {
      return res.status(400).json({
        success: false,
        message: 'Consent must be explicitly agreed to'
      });
    }

    // Update user with consent information
    let user;
    if (global.MOCK_MODE) {
      user = findUserByIdInMock(req.userId);
      if (user) {
        user.consentGiven = true;
        user.consentDate = consentDate || new Date();
      }
    } else {
      user = await User.findByIdAndUpdate(
        req.userId,
        {
          consentGiven: true,
          consentDate: consentDate || new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consent recorded successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        consentGiven: user.consentGiven,
        consentDate: user.consentDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording consent',
      error: error.message
    });
  }
};
