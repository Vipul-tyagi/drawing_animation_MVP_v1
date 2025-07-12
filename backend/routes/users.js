const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserBalance } = require('../services/userService');

// Route to get the authenticated user's balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated.' });
    }

    const balance = await getUserBalance(req.user.email);
    res.json({ success: true, balance: balance });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user balance.' });
  }
});

module.exports = router;
