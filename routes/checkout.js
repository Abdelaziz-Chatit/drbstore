const express = require('express');
const router = express.Router();
const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');

// Middleware to check cart
const checkCart = (req, res, next) => {
  if (!req.session.cart || Object.keys(req.session.cart).length === 0) {
    return res.redirect('/cart');
  }
  next();
};

// Checkout page
router.get('/', checkCart, async (req, res) => {
  try {
    const cart = req.session.cart;
    const cartItems = [];
    let total = 0;

    for (const [productId, quantity] of Object.entries(cart)) {
      const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
      if (products.length > 0) {
        cartItems.push({
          product: products[0],
          quantity: quantity
        });
        total += parseFloat(products[0].price) * quantity;
      }
    }

    res.render('checkout/index', {
      title: 'Checkout - DRB Store',
      cartItems: cartItems,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).render('error', { message: 'Error loading checkout' });
  }
});

// Process checkout
router.post('/', checkCart, [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/checkout');
  }

  try {
    const { name, email, phone, address } = req.body;
    const cart = req.session.cart;
    const cartItems = [];
    let total = 0;

    // Get cart items with product details
    for (const [productId, quantity] of Object.entries(cart)) {
      const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
      if (products.length > 0) {
        cartItems.push({
          product: products[0],
          quantity: quantity
        });
        total += parseFloat(products[0].price) * quantity;
      }
    }

    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    // Create order
    const [orderResult] = await db.execute(
      'INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.session.user ? req.session.user.id : null,
        name,
        email,
        phone || null,
        address,
        total.toFixed(2),
        'pending'
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of cartItems) {
      await db.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product.id, item.quantity, item.product.price]
      );
    }

    // Create Stripe checkout session
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.product.description || ''
        },
        unit_amount: Math.round(parseFloat(item.product.price) * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/checkout/success?orderId=${orderId}`,
      cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel?orderId=${orderId}`,
      client_reference_id: orderId.toString(),
      customer_email: email,
      metadata: {
        order_id: orderId.toString()
      }
    });

    res.redirect(session.url);
  } catch (error) {
    console.error('Checkout process error:', error);
    res.status(500).render('error', { message: 'Checkout failed' });
  }
});

// Success page
router.get('/success', async (req, res) => {
  const { orderId } = req.query;
  req.session.cart = {}; // Clear cart

  if (orderId) {
    try {
      const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
      res.render('checkout/success', {
        title: 'Order Success - DRB Store',
        order: orders[0] || null
      });
    } catch (error) {
      res.render('checkout/success', { title: 'Order Success - DRB Store', order: null });
    }
  } else {
    res.render('checkout/success', { title: 'Order Success - DRB Store', order: null });
  }
});

// Cancel page
router.get('/cancel', (req, res) => {
  res.render('checkout/cancel', { title: 'Payment Cancelled - DRB Store' });
});

module.exports = router;

