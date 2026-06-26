const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Asset = require('../models/Asset');

const TEST_DB_URI = 'mongodb://localhost:27017/aura_test_db';

beforeAll(async () => {
  // Connect to a test-specific database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  // Clean up database collections and close connection
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear collections before each test to maintain isolation
  await User.deleteMany({});
  await Asset.deleteMany({});
});

describe('Mongoose Schema Validation Tests', () => {
  
  test('User Model validation fails with invalid email format', async () => {
    const user = new User({
      username: 'testuser',
      email: 'invalid-email-format',
      password: 'hashedpassword123'
    });
    
    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.email.message).toContain('valid email address');
  });

  test('User Model validation fails with username too short', async () => {
    const user = new User({
      username: 'usr',
      email: 'test@example.com',
      password: 'hashedpassword123'
    });
    
    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.username).toBeDefined();
    expect(error.errors.username.message).toContain('at least 5 characters');
  });

  test('Asset Model validation fails with invalid category enum', async () => {
    const asset = new Asset({
      title: 'Invalid Cat Asset',
      description: 'An asset with invalid category',
      category: 'invalid-category-name',
      code: 'p { color: red; }',
      creatorName: 'testuser',
      creator: new mongoose.Types.ObjectId()
    });
    
    let error;
    try {
      await asset.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.category.message).toContain('Category must be either: css, sass, palette, svg, or other');
  });
});

describe('Authentication API Endpoint Tests', () => {

  test('POST /api/auth/register creates a new user and session', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'darell123',
        email: 'darell@test.com',
        password: 'password123'
      });
      
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('darell123');
    expect(res.body.user.email).toBe('darell@test.com');
    expect(res.headers['set-cookie']).toBeDefined(); // Session cookie established
  });

  test('POST /api/auth/login succeeds with correct password', async () => {
    // Manually register a user first
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'alice123',
        email: 'alice@test.com',
        password: 'alicepassword'
      });
      
    expect(registerRes.status).toBe(201);

    // Try logging in
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        loginIdentifier: 'alice123',
        password: 'alicepassword'
      });
      
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  test('POST /api/auth/login fails with incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'bob12345',
        email: 'bob@test.com',
        password: 'bobpassword'
      });
      
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        loginIdentifier: 'bob12345',
        password: 'wrongpassword'
      });
      
    expect(loginRes.status).toBe(400);
    expect(loginRes.body.success).toBeUndefined();
    expect(loginRes.body.message).toContain('Invalid');
  });
});

describe('Catalog API Routing & Authorization Tests', () => {

  test('GET /api/assets should load for unauthenticated guests', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/assets should return 401 Unauthorized for guests', async () => {
    const res = await request(app)
      .post('/api/assets')
      .send({
        title: 'Unauthorized Button',
        description: 'Should not allow guest submission',
        category: 'css',
        code: '.btn { border: 1px solid; }',
        tags: 'guest, fail'
      });
      
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Unauthorized');
  });
});
