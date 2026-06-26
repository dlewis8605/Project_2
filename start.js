const mongoose = require('mongoose');
const app = require('./app');
const User = require('./models/User');
const Asset = require('./models/Asset');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aura_db';

// Seeding function
const seedDatabase = async () => {
  try {
    const assetCount = await Asset.countDocuments();
    if (assetCount > 0) {
      console.log('Database already populated. Skipping seed.');
      return;
    }

    console.log('Seeding database with premium assets...');

    // 1. Create or Find Seeder User
    let curator = await User.findOne({ username: 'aura_curator' });
    if (!curator) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('curatorpass123', salt);
      curator = new User({
        username: 'aura_curator',
        email: 'curator@auracatalog.com',
        password: hashedPassword
      });
      await curator.save();
    }

    // 2. Define default assets
    const defaultAssets = [
      {
        title: 'Premium Glass Card',
        description: 'A frosted glassmorphic card container featuring backdrop-filter blurring, thin borders, and soft double shadows. Perfect for dashboard panels.',
        category: 'css',
        code: `<div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; color: #f3f1fe; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); font-family: sans-serif; text-align: center; max-width: 300px;">
  <h4 style="margin: 0 0 10px 0; color: #a855f7;">Glassmorphism</h4>
  <p style="margin: 0; color: #9f9bbf; font-size: 14px;">Stunning visual overlay container built with backdrop CSS rules.</p>
</div>`,
        tags: ['glassmorphism', 'card', 'frosted', 'container'],
        creator: curator._id,
        creatorName: curator.username,
        downloads: 42
      },
      {
        title: 'Glowing Neon Button',
        description: 'A glowing purple-to-blue gradient button with interactive scale transitions and drop-shadow animation on hover state.',
        category: 'css',
        code: `<button style="background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); border: none; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4); outline: none;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(168, 85, 247, 0.6)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(168, 85, 247, 0.4)';">
  Aura Button
</button>`,
        tags: ['button', 'gradient', 'neon', 'interactive'],
        creator: curator._id,
        creatorName: curator.username,
        downloads: 87
      },
      {
        title: 'Neon Aura Theme Palette',
        description: 'The curated color system used to style high-end design catalog dashboards, combining neon violet, pinks, and indigo colors.',
        category: 'palette',
        code: `Background: #0b0816\nPrimary Glow: #a855f7\nAccent Glow: #ec4899\nIndigo Glow: #6366f1\nText Primary: #f3f1fe\nText Muted: #9f9bbf`,
        tags: ['colors', 'palette', 'theme', 'neon'],
        creator: curator._id,
        creatorName: curator.username,
        downloads: 18
      },
      {
        title: 'Spinning Gradient Ring Loader',
        description: 'An elegant SVG spinner circle that orbits dynamically using local CSS keyframe animations, featuring a linear gradient stroke.',
        category: 'svg',
        code: `<svg width="60" height="60" viewBox="0 0 50 50" style="animation: auraRotate 2s linear infinite;">
  <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4"/>
  <circle cx="25" cy="25" r="20" fill="none" stroke="url(#purpleGlow)" stroke-width="4" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
  <defs>
    <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes auraRotate { 100% { transform: rotate(360deg); } }
  </style>
</svg>`,
        tags: ['loader', 'spinner', 'svg', 'gradient', 'animated'],
        creator: curator._id,
        creatorName: curator.username,
        downloads: 54
      }
    ];

    await Asset.insertMany(defaultAssets);
    console.log('Seeded database successfully.');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Connect to MongoDB
mongoose.connect(DB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`AURA server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error.message);
    process.exit(1);
  });

