const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhookEvent } = require('../services/paymentService');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint to create a Stripe Checkout Session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const userEmail = req.user.email; // Assuming authMiddleware adds user info to req.user

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount provided.' });
  }

  try {
    const sessionUrl = await createCheckoutSession(amount, userEmail);
    res.json({ url: sessionUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    await handleWebhookEvent(req.body, sig, webhookSecret);
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;
