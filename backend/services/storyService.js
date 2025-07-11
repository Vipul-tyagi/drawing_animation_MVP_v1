const OpenAI = require('openai');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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

// Validate environment variables
if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME || !process.env.OPENAI_API_KEY || !CREATIONS_TABLE_NAME) {
  console.error('Missing one or more environment variables for S3, OpenAI, or DynamoDB in storyService. Please check your .env file.');
  // Depending on desired behavior, you might want to throw an error here to prevent the app from starting
  // throw new Error('Missing environment variables for S3 or OpenAI in storyService.');
}

async function generateStory(imageId, drawingDescription, s3Key) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Use the provided s3Key directly
    const getObjectParams = {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    };

    let Body;
    try {
      ({ Body } = await s3Client.send(new GetObjectCommand(getObjectParams)));
    } catch (s3Error) {
      console.error(`Error fetching image from S3 for story generation (${s3Key}):`, s3Error);
      throw new Error(`Failed to retrieve drawing from storage: ${s3Error.message}`);
    }

    const imageBuffer = Buffer.from(await Body.transformToByteArray());
    const base64Image = imageBuffer.toString('base64');

    const storyPrompt = `Generate a creative and imaginative bedtime story inspired by this drawing. The user has provided the following description: "${drawingDescription}". Please use this description as the central theme of the story. The story should be child-friendly, positive, and have a clear beginning, middle, and end.`;

    console.log(`Generating story for image ${imageId} with prompt: ${storyPrompt}`);

    let chatCompletionResponse;
    try {
      chatCompletionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: storyPrompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          },
        ],
      });
    } catch (openaiError) {
      console.error('Error calling OpenAI for story generation:', openaiError.response ? openaiError.response.data : openaiError.message);
      throw new Error(`OpenAI story generation failed: ${openaiError.message}`);
    }

    const generatedStory = chatCompletionResponse.choices[0].message.content;
    if (!generatedStory) {
      console.error('OpenAI story generation returned no content.');
      throw new Error('OpenAI story generation returned empty content.');
    }
    console.log('Generated Story:', generatedStory);

    // Update DynamoDB with the generated story
    const updateParams = {
      TableName: CREATIONS_TABLE_NAME,
      Key: { creationId: imageId },
      UpdateExpression: 'SET bedtimeStoryText = :story',
      ExpressionAttributeValues: {
        ':story': generatedStory,
      },
    };
    await docClient.send(new UpdateCommand(updateParams));
    console.log('DynamoDB creation record updated with story.');

    return generatedStory;
  } catch (error) {
    console.error('Error generating story:', error.message, error.stack);
    throw new Error(`Failed to generate story: ${error.message}`);
  }
}

module.exports = {
  generateStory,
};