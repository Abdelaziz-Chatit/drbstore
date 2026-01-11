const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Initialize cart in session
const initCart = (req) => {
  if (!req.session.cart) {
    req.session.cart = {};
  }
};

// Cart page
router.get('/', async (req, res) => {
  try {
    initCart(req);
    const cart = req.session.cart;
    const cartItems = [];

    for (const [productId, quantity] of Object.entries(cart)) {
      const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
      if (products.length > 0) {
        cartItems.push({
          product: products[0],
          quantity: quantity
        });
      }
    }

    let total = 0;
    cartItems.forEach(item => {
      total += parseFloat(item.product.price) * item.quantity;
    });

    res.render('cart/index', {
      title: 'Shopping Cart - DRB Store',
      cartItems: cartItems,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).render('error', { message: 'Error loading cart' });
  }
});

// Add to cart
router.post('/add/:id', async (req, res) => {
  try {
    initCart(req);
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;

    if (req.session.cart[productId]) {
      req.session.cart[productId] += quantity;
    } else {
      req.session.cart[productId] = quantity;
    }

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      const cartCount = Object.values(req.session.cart).reduce((a, b) => a + b, 0);
      return res.json({ success: true, message: 'Added to cart', cartCount });
    }

    res.redirect('/cart');
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Error adding to cart' });
  }
});

// Update cart item
router.post('/update/:id', async (req, res) => {
  try {
    initCart(req);
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;

    if (quantity <= 0) {
      delete req.session.cart[productId];
    } else {
      req.session.cart[productId] = quantity;
    }

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      const cartCount = Object.values(req.session.cart).reduce((a, b) => a + b, 0);
      return res.json({ success: true, message: 'Cart updated', cartCount });
    }

    res.redirect('/cart');
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Error updating cart' });
  }
});

// Remove from cart
router.post('/remove/:id', async (req, res) => {
  try {
    initCart(req);
    const productId = req.params.id;
    delete req.session.cart[productId];

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      const cartCount = Object.values(req.session.cart).reduce((a, b) => a + b, 0);
      return res.json({ success: true, message: 'Removed from cart', cartCount });
    }

    res.redirect('/cart');
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Error removing from cart' });
  }
});

// Clear cart
router.post('/clear', (req, res) => {
  req.session.cart = {};
  res.redirect('/cart');
});

// Get cart count (API)
router.get('/count', (req, res) => {
  initCart(req);
  const cartCount = Object.values(req.session.cart).reduce((a, b) => a + b, 0);
  res.json({ count: cartCount });
});

module.exports = router;

