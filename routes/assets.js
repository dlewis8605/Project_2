const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const User = require('../models/User');

// Middleware to protect routes that require authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
  }
  next();
};

// @route   GET /api/assets
// @desc    Get all assets with optional filtering (search and category)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Apply category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving assets', error: error.message });
  }
});

// @route   POST /api/assets
// @desc    Submit a new design asset (authenticated only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, category, code, tags } = req.body;

    // Validation
    if (!title || !description || !category || !code) {
      return res.status(400).json({ message: 'Title, description, category, and code are required.' });
    }

    const allowedCategories = ['css', 'sass', 'palette', 'svg', 'other'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Choose from: css, sass, palette, svg, other.' });
    }

    // Parse tags (handles array or comma-separated string)
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag.length > 0);
      }
    }

    const newAsset = new Asset({
      title: title.trim(),
      description: description.trim(),
      category,
      code,
      tags: tagsArray,
      creator: req.session.userId,
      creatorName: req.session.username
    });

    const savedAsset = await newAsset.save();
    res.status(201).json(savedAsset);
  } catch (error) {
    res.status(500).json({ message: 'Error saving asset', error: error.message });
  }
});

// @route   POST /api/assets/:id/favorite
// @desc    Toggle favorite status for an asset (authenticated only)
router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const assetId = req.params.id;
    const userId = req.session.userId;

    // Check if asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.favorites.indexOf(assetId);
    let favorited = false;

    if (index === -1) {
      // Add to favorites
      user.favorites.push(assetId);
      favorited = true;
    } else {
      // Remove from favorites
      user.favorites.splice(index, 1);
      favorited = false;
    }

    await user.save();
    res.json({ success: true, favorited, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
});

// @route   POST /api/assets/:id/download
// @desc    Increment download/copy count of an asset
router.post('/:id/download', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    asset.downloads += 1;
    await asset.save();

    res.json({ success: true, downloads: asset.downloads });
  } catch (error) {
    res.status(500).json({ message: 'Error updating download count', error: error.message });
  }
});

// @route   GET /api/assets/favorites
// @desc    Get user's favorited assets (authenticated only)
router.get('/favorites', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate({
      path: 'favorites',
      options: { sort: { createdAt: -1 } }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving favorites', error: error.message });
  }
});

module.exports = router;
