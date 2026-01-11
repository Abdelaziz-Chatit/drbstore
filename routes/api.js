const express = require('express');
const router = express.Router();
const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe webhook
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id;

    try {
      // Update order status
      await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['paid', orderId]
      );

      // Create payment record
      await db.execute(
        'INSERT INTO payments (order_id, stripe_payment_id, amount, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
        [orderId, session.payment_intent, session.amount_total / 100, 'completed', 'completed']
      );
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  res.json({ received: true });
});

module.exports = router;

