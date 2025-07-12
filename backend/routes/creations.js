const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const router = express.Router();

const CREATIONS_TABLE_NAME = process.env.CREATIONS_TABLE_NAME || 'creations';
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || 'users'; // Added for clarity, though not directly used here

// Initialize DynamoDB Document Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

// Route to get all creations for the authenticated user (MUST BE BEFORE /:creationId)
router.get('/my-creations', async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated.' });
    }

    const queryParams = {
      TableName: CREATIONS_TABLE_NAME,
      IndexName: 'UserCreationsIndex', // Name of the GSI you created
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: {
        ':u': req.user.email,
      },
    };

    const { Items } = await docClient.send(new QueryCommand(queryParams));

    res.json({ success: true, creations: Items || [] });
  } catch (error) {
    console.error('Error fetching user creations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user creations.' });
  }
});

// Route to get a single creation by ID
router.get('/:creationId', async (req, res) => {
  try {
    const { creationId } = req.params;

    const getParams = {
      TableName: CREATIONS_TABLE_NAME,
      Key: { creationId: creationId },
    };

    const { Item } = await docClient.send(new GetCommand(getParams));

    if (Item) {
      // Ensure only the owner can access their creation
      if (req.user && Item.userId !== req.user.email) {
        return res.status(403).json({ success: false, error: 'Access denied.' });
      }
      res.json({ success: true, creation: Item });
    } else {
      res.status(404).json({ success: false, error: 'Creation not found.' });
    }
  } catch (error) {
    console.error('Error fetching single creation:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch creation.' });
  }
});

module.exports = router;
