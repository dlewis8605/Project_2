const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');

const app = express();

// 1. Security Headers (OWASP)
// Customize helmet to allow CDNs (Vue, FontAwesome, Bootstrap)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net", // Vue, Bootstrap, Popper
          "https://code.jquery.com", // jQuery
          "https://cdnjs.cloudflare.com", // FontAwesome
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: ["'self'", "data:", "https:*"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// 2. Rate Limiting (OWASP - Brute Force Protection)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login/register requests per window
  message: 'Too many authentication attempts. Please try again after 15 minutes'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 3. Body parsers with size limit (OWASP - DoS Protection)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Data Sanitization (OWASP)
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(xss()); // Prevent XSS

// 5. Session Configuration with MongoStore
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/aura_db';
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'aura-premium-glass-catalog-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: dbUrl,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // Session expires in 1 day
    }),
    cookie: {
      httpOnly: true, // Prevent XSS stealing cookies
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax',
    },
  })
);

// 6. Routes API
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);

// 7. Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for undefined frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

module.exports = app;
