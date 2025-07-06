const express = require('express');
const router = express.Router();
const storyService = require('../services/storyService');

router.post('/', async (req, res) => {
  try {
    const { imageId, drawingDescription } = req.body;
    if (!imageId) {
      return res.status(400).json({ success: false, error: 'Image ID is required.' });
    }

    const storyResult = await storyService.generateStory(imageId, drawingDescription);
    res.json({ success: true, story: storyResult });
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({ success: false, error: 'Failed to generate story.' });
  }
});

module.exports = router;