const express = require('express');
const { enhanceImage } = require('../services/imageEnhancement');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { imageId, enhancementType, prompt } = req.body;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        error: 'Image ID is required'
      });
    }

    const result = await enhanceImage(imageId, enhancementType, prompt);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({
      success: false,
      error: 'Enhancement failed'
    });
  }
});

module.exports = router;
