const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { registerUser, loginUser } = require('../../services/authService');

// Mock the DynamoDBDocumentClient
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const mDynamoDB = {
    send: jest.fn(),
  };
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => mDynamoDB),
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
  };
});

const mDocClient = DynamoDBDocumentClient.from();

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mDocClient.send.mockClear();
    GetCommand.mockClear();
    PutCommand.mockClear();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      mDocClient.send.mockResolvedValueOnce({ Item: null }); // No existing user
      mDocClient.send.mockResolvedValueOnce({}); // Successful put

      // Act
      const result = await registerUser('test@example.com', 'password123');

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(PutCommand).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the user already exists', async () => {
      // Arrange
      mDocClient.send.mockResolvedValueOnce({ Item: { email: 'test@example.com' } });

      // Act & Assert
      await expect(registerUser('test@example.com', 'password123')).rejects.toThrow(
        'User with that email already exists.'
      );
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('password123', 10);
      mDocClient.send.mockResolvedValueOnce({ Item: { userId: '123', email: 'test@example.com', passwordHash: hashedPassword } });

      // Act
      const result = await loginUser('test@example.com', 'password123');

      // Assert
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual({ id: '123', email: 'test@example.com' });
    });

    it('should throw an error for invalid credentials if user does not exist', async () => {
      // Arrange
      mDocClient.send.mockResolvedValueOnce({ Item: null });

      // Act & Assert
      await expect(loginUser('test@example.com', 'password123')).rejects.toThrow('Invalid credentials.');
    });

    it('should throw an error for invalid credentials if password does not match', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('password123', 10);
      mDocClient.send.mockResolvedValueOnce({ Item: { userId: '123', email: 'test@example.com', passwordHash: hashedPassword } });

      // Act & Assert
      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials.');
    });
  });
});
