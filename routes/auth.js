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

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;

