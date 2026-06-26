const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Asset title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Asset description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['css', 'sass', 'palette', 'svg', 'other'],
      message: 'Category must be either: css, sass, palette, svg, or other'
    }
  },
  code: {
    type: String,
    required: [true, 'Asset code content is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Asset', AssetSchema);
