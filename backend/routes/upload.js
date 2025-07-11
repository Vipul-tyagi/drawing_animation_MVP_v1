const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

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
const CREATIONS_TABLE_NAME = process.env.CREATIONS_TABLE_NAME || 'creations';

// Initialize DynamoDB Document Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

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
  console.log('Upload route: req.body:', req.body);
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileId = uuidv4();
    const ext = '.' + req.file.mimetype.split('/')[1]; // Get extension from mimetype
    const s3Key = `uploads/${fileId}${ext}`;
    const userPromptText = req.body.story || ''; // Extract story from req.body as userPromptText
    const originalImageUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Upload to S3
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read', // Make the object publicly readable
      Metadata: {
        'user-prompt': userPromptText, // Save the user prompt as metadata
        'user-id': req.user.userId, // Assuming req.user is populated by auth middleware
      },
    };
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Create item in DynamoDB creations table
    const creationItem = {
      creationId: fileId,
      userId: req.user.userId, // User ID from authenticated request
      originalImageUrl: originalImageUrl,
      userPromptText: userPromptText,
      s3Key: s3Key, // Add s3Key to DynamoDB record
      timestamp: new Date().toISOString(),
    };

    const putCreationParams = {
      TableName: CREATIONS_TABLE_NAME,
      Item: creationItem,
    };
    await docClient.send(new PutCommand(putCreationParams));
    console.log('Creation record added to DynamoDB:', creationItem);
    
    res.json({
      success: true,
      id: fileId,
      filename: `${fileId}${ext}`,
      url: originalImageUrl,
      s3Key: s3Key,
      size: req.file.size,
      story: userPromptText, // Return userPromptText as story for now
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
