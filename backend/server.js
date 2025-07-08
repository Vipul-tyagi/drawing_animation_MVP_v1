const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const enhanceRoutes = require('./routes/enhance');
const storyRoutes = require('./routes/story');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_FRONTEND_URL || '*' // Allow requests from your frontend or all origins
}));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/enhance', enhanceRoutes);
app.use('/api/story', storyRoutes);

// Basic root route to confirm backend is running
app.get('/', (req, res) => {
  res.send('Hello from Drawing to Animation Backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
