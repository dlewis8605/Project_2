const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Helper to validate email format
const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (username.trim().length < 5) {
      return res.status(400).json({ message: 'Username must be at least 5 characters long' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }] 
    });

    if (userExists) {
      if (userExists.username.toLowerCase() === username.trim().toLowerCase()) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // Establish session
    req.session.userId = savedUser._id;
    req.session.username = savedUser.username;

    res.status(201).json({
      success: true,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login a user
router.post('/login', async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body; // loginIdentifier can be username or email

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase().trim() },
        { username: loginIdentifier.trim() }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username/email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username/email or password' });
    }

    // Establish session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout a user
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// @route   GET /api/auth/me
// @desc    Get current user details from session
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }

  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ authenticated: false, message: 'User not found' });
    }
    res.json({
      authenticated: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user session', error: error.message });
  }
});

module.exports = router;
