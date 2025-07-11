const express = require('express');
const router = express.Router();
const storyService = require('../services/storyService');

router.post('/', async (req, res) => {
  try {
    const { imageId, drawingDescription, s3Key } = req.body;
    if (!imageId || !s3Key) {
      return res.status(400).json({ success: false, error: 'Image ID and S3 Key are required.' });
    }

    const storyResult = await storyService.generateStory(imageId, drawingDescription, s3Key);
    res.json({ success: true, story: storyResult });
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({ success: false, error: 'Failed to generate story.' });
  }
});

module.exports = router;