const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const enhanceRoutes = require('./routes/enhance');
const storyRoutes = require('./routes/story');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure temp directories exist
const tempDirs = ['./tmp/uploads', './tmp/outputs', './tmp/enhanced'];
tempDirs.forEach(dir => {
  fs.ensureDirSync(dir);
});

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/enhance', enhanceRoutes);
app.use('/api/story', storyRoutes);

// Serve static files
app.use('/uploads', express.static('./tmp/uploads'));
app.use('/outputs', express.static('./tmp/outputs'));
app.use('/enhanced', express.static('./tmp/enhanced'));

// Cleanup old files every 15 minutes
setInterval(() => {
  const cleanupService = require('./utils/cleanup');
  cleanupService.cleanupOldFiles();
}, 15 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
