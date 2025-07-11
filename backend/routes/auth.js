const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.registerUser(email, password);
    res.status(201).json({ success: true, message: 'User registered successfully.', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await authService.loginUser(email, password);
    res.json({ success: true, user: { id: user.id, email: user.email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, error: error.message });
  }
});

module.exports = router;
