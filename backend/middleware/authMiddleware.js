const authService = require('../services/authService');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ success: false, error: 'Authentication token required.' });
  }

  console.log('Auth Middleware: Received token:', token); // Log the token
  const decoded = authService.verifyToken(token);
  console.log('Auth Middleware: Decoded token:', decoded); // Log the decoded token

  if (!decoded) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
  }

  req.user = decoded; // Attach user information to the request
  next();
};

module.exports = authenticateToken;
