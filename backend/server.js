const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const enhanceRoutes = require('./routes/enhance');
const storyRoutes = require('./routes/story');
const authRoutes = require('./routes/auth');
const creationsRoutes = require('./routes/creations');
const authenticateToken = require('./middleware/authMiddleware');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_FRONTEND_URL || '*' // Allow requests from your frontend or all origins
}));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/enhance', authenticateToken, enhanceRoutes);
app.use('/api/story', authenticateToken, storyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/creations', authenticateToken, creationsRoutes);

// Basic root route to confirm backend is running
app.get('/', (req, res) => {
  res.send('Hello from Drawing to Animation Backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
