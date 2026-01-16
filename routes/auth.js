const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/login', { title: 'Login - DRB Store', error: null });
});

// Login handler
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', { title: 'Login - DRB Store', error: 'Invalid input' });
  }

  try {
    const { email, password } = req.body;
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.render('auth/login', { title: 'Login - DRB Store', error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.render('auth/login', { title: 'Login - DRB Store', error: 'Invalid credentials' });
    }

    // Parse roles JSON
    const roles = typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles;

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: roles
    };

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { title: 'Login - DRB Store', error: 'Login failed' });
  }
});

// Register page
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/register', { title: 'Register - DRB Store', error: null });
});

// Register handler
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 150 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/register', { title: 'Register - DRB Store', error: 'Invalid input' });
  }

  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.render('auth/register', { title: 'Register - DRB Store', error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.execute(
      'INSERT INTO users (name, email, password, phone, roles) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, JSON.stringify(['ROLE_USER'])]
    );

    req.session.success = 'Registration successful! Please login.';
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Register error:', error);
    res.render('auth/register', { title: 'Register - DRB Store', error: 'Registration failed' });
  }
});

// User Profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const [users] = await db.execute(
      'SELECT id, name, email, phone, roles, created_at FROM users WHERE id = ?',
      [req.session.user.id]
    );

    if (users.length === 0) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    const user = users[0];
    const roles = typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles;

    res.render('profile', {
      title: 'My Profile - DRB Store',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: roles,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', { message: 'Error loading profile' });
  }
});

// Update User Profile
router.post('/profile/update', async (req, res) => {
  try {
    if (!req.session.user) {
      console.log('No session user found');
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { name, email, phone } = req.body;
    console.log('Update profile request:', { name, email, phone, userId: req.session.user.id });

    // Validate input
    if (!name || !email) {
      console.log('Missing required fields');
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    // Check if email is already used by another user
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.session.user.id]
    );

    if (existing.length > 0) {
      console.log('Email already in use');
      return res.status(400).json({ success: false, error: 'Email already in use by another account' });
    }

    // Update user in database
    const result = await db.execute(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone || null, req.session.user.id]
    );
    console.log('Update result:', result);

    // Update session
    req.session.user.name = name;
    req.session.user.email = email;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, error: 'Error saving session' });
      }
      res.json({ success: true, message: 'Profile updated successfully' });
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error updating profile' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;

