const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use a strong secret in production
const JWT_EXPIRES_IN = '7d';
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || 'users'; // DynamoDB table name for users

console.log('AuthService: JWT_SECRET being used:', JWT_SECRET); // Log the secret

// Initialize DynamoDB Document Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

async function registerUser(email, password) {
  // Check if user already exists
  const { Item } = await docClient.send(new GetCommand({
    TableName: USERS_TABLE_NAME,
    Key: { email: email },
  }));

  if (Item) {
    throw new Error('User with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10); // Hash password with salt rounds
  const userId = `user-${Date.now()}`;

  const putParams = {
    TableName: USERS_TABLE_NAME,
    Item: {
      userId: userId,
      email: email,
      passwordHash: passwordHash,
    },
  };

  await docClient.send(new PutCommand(putParams));
  console.log('Registered new user:', email);
  return { id: userId, email: email };
}

async function loginUser(email, password) {
  const { Item } = await docClient.send(new GetCommand({
    TableName: USERS_TABLE_NAME,
    Key: { email: email },
  }));

  if (!Item) {
    throw new Error('Invalid credentials.');
  }

  const user = Item;
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials.');
  }

  const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  console.log('User logged in:', user.email);
  return { user: { id: user.userId, email: user.email }, token };
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('AuthService: Token verification failed:', error.message); // Log the specific error
    return null; // Token is invalid or expired
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
};