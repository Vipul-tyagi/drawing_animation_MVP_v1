const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || 'users';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

async function addBalance(email, amount) {
  if (amount <= 0) {
    throw new Error('Amount to add must be positive.');
  }

  const params = {
    TableName: USERS_TABLE_NAME,
    Key: { email: email },
    UpdateExpression: 'SET balance = if_not_exists(balance, :start) + :inc',
    ExpressionAttributeValues: {
      ':inc': amount,
      ':start': 0,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const { Attributes } = await docClient.send(new UpdateCommand(params));
    console.log(`User ${email} balance updated to: ${Attributes.balance}`);
    return Attributes.balance;
  } catch (error) {
    console.error(`Error adding balance for user ${email}:`, error);
    throw new Error('Failed to add balance.');
  }
}

async function deductBalance(email, amount) {
  if (amount <= 0) {
    throw new Error('Amount to deduct must be positive.');
  }

  const params = {
    TableName: USERS_TABLE_NAME,
    Key: { email: email },
    UpdateExpression: 'SET balance = balance - :dec',
    ConditionExpression: 'balance >= :dec', // Ensure sufficient funds
    ExpressionAttributeValues: {
      ':dec': amount,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const { Attributes } = await docClient.send(new UpdateCommand(params));
    console.log(`User ${email} balance updated to: ${Attributes.balance}`);
    return Attributes.balance;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('Insufficient funds.');
    }
    console.error(`Error deducting balance for user ${email}:`, error);
    throw new Error('Failed to deduct balance.');
  }
}

async function getUserBalance(email) {
  const params = {
    TableName: USERS_TABLE_NAME,
    Key: { email: email },
    ProjectionExpression: 'balance',
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    console.log(`getUserBalance: Fetched Item for ${email}:`, Item);
    const balance = Item ? Item.balance || 0 : 0;
    console.log(`getUserBalance: Returning balance for ${email}:`, balance);
    return balance; // Return 0 if balance is not set or user not found
  } catch (error) {
    console.error(`Error getting balance for user ${userId}:`, error);
    throw new Error('Failed to retrieve balance.');
  }
}

module.exports = {
  addBalance,
  deductBalance,
  getUserBalance,
};
