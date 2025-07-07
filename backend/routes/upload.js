const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { validateImage } = require('../utils/validation');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const router = express.Router();

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Use memory storage for multer to get file buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Validate image (if needed, can be done on buffer)
    // const validation = await validateImage(req.file.buffer); // Adjust validateImage to accept buffer
    // if (!validation.valid) {
    //   return res.status(400).json({ success: false, error: validation.error });
    // }

    const fileId = uuidv4();
    const ext = '.' + req.file.mimetype.split('/')[1]; // Get extension from mimetype
    const s3Key = `uploads/${fileId}${ext}`;

    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read', // Make the object publicly readable
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`Original image uploaded to S3: s3://${S3_BUCKET_NAME}/${s3Key}`);

    const story = req.body.story || ''; // Extract story from req.body
    
    res.json({
      success: true,
      id: fileId,
      filename: `${fileId}${ext}`,
      url: `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
      size: req.file.size,
      story: story,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

module.exports = router;
