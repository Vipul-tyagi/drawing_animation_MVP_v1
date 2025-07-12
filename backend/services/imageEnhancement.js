const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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
  console.error('Missing one or more environment variables for S3, OpenAI, or DynamoDB. Please check your .env file.');
  // Depending on desired behavior, you might want to throw an error here to prevent the app from starting
  // throw new Error('Missing environment variables for S3 or OpenAI.');
}

// Define the base prompt for stylization
const BASE_STYLIZE_PROMPT = 'Transform this child’s drawing into a hyper-realistic, cinematic 3D render as if it were captured through a high-end film camera in the real world. Every detail of the original drawing must be preserved with absolute fidelity — including all imperfections, unusual proportions, crooked lines, lopsided features, exaggerated expressions, and imaginative distortions. Do not clean up, beautify, or refine any part of the artwork — maintain the raw spontaneity and creative quirks exactly as they appear.Render the figures and objects using ultra-realistic materials: soft, lifelike skin; fuzzy felt or fabric textures for clothing; wispy natural hair; realistically shaded fur for animals; and aged, weathered wood for houses or structures. Integrate accurate physical lighting, directional shadows, and cinematic depth of field — as required to highlight the objects and scenes and shot with a full-frame lens.Place the entire scene in a visually appropriate setting that matches the tone and vibe of the child’s imagination — playful, whimsical, and slightly surreal. The final image should feel like a movie still or a high-budget CGI frame — photorealistic, emotionally rich, and deeply faithful to the original hand-drawn story.';

async function enhanceImage(imageId, enhancementType, prompt) {
  console.log('enhanceImage called with:', { imageId, enhancementType, prompt });
  try {
    // Assuming imageId is the S3 key for the original image
    const { Item } = await docClient.send(new GetCommand({
      TableName: CREATIONS_TABLE_NAME,
      Key: { creationId: imageId },
    }));

    if (!Item || !Item.s3Key) {
      throw new Error(`Creation record or s3Key not found for imageId: ${imageId}`);
    }

    const s3KeyOriginal = Item.s3Key;

    if (enhancementType === 'stylize') {
      console.log('Enhancement type: stylize');
      // For 'stylize', combine the base prompt with the generated story
      const combinedPrompt = `${BASE_STYLIZE_PROMPT}\n\nStory to incorporate: ${prompt}`;
      const result = await enhanceWithOpenAI(s3KeyOriginal, combinedPrompt);
      if (result.success) {
        const outputId = uuidv4();
        const s3KeyEnhanced = `enhanced/${outputId}.png`; // S3 key for the enhanced image
        const enhancedImageUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3KeyEnhanced}`;

        // Upload to S3
        const uploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: s3KeyEnhanced,
          Body: result.imageBuffer,
          ContentType: 'image/png',
          ACL: 'public-read', // Make the object publicly readable
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Enhanced image uploaded to S3: s3://${S3_BUCKET_NAME}/${s3KeyEnhanced}`);

        // Update DynamoDB with the enhanced image URL
        const updateParams = {
          TableName: CREATIONS_TABLE_NAME,
          Key: { creationId: imageId },
          UpdateExpression: 'SET enhancedImageUrl = :url',
          ExpressionAttributeValues: {
            ':url': enhancedImageUrl,
          },
        };
        await docClient.send(new UpdateCommand(updateParams));
        console.log('DynamoDB creation record updated with enhanced image URL.');

        return {
          success: true,
          id: outputId,
          url: enhancedImageUrl
        };
      } else {
        console.error(`OpenAI stylize enhancement failed for image ${imageId}:`, result.error);
        return { success: false, error: `Stylization failed: ${result.error}` };
      }
    } else if (enhancementType === 'custom' && prompt) {
      console.log('Enhancement type: custom');
      // Combine the base prompt with the user's custom prompt for 'custom' enhancement
      // The user's prompt will add specific details to the base stylization instructions.
      const combinedPrompt = `${BASE_STYLIZE_PROMPT}\n\nUser's specific request: ${prompt}`;

      const result = await enhanceWithOpenAI(s3KeyOriginal, combinedPrompt);
      if (result.success) {
        const outputId = uuidv4();
        const s3KeyEnhanced = `enhanced/${outputId}.png`; // S3 key for the enhanced image
        const enhancedImageUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3KeyEnhanced}`;

        // Upload to S3
        const uploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: s3KeyEnhanced,
          Body: result.imageBuffer,
          ContentType: 'image/png',
          ACL: 'public-read', // Make the object publicly readable
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Enhanced image uploaded to S3: s3://${S3_BUCKET_NAME}/${s3KeyEnhanced}`);

        // Update DynamoDB with the enhanced image URL
        const updateParams = {
          TableName: CREATIONS_TABLE_NAME,
          Key: { creationId: imageId },
          UpdateExpression: 'SET enhancedImageUrl = :url',
          ExpressionAttributeValues: {
            ':url': enhancedImageUrl,
          },
        };
        await docClient.send(new UpdateCommand(updateParams));
        console.log('DynamoDB creation record updated with enhanced image URL.');

        return {
          success: true,
          id: outputId,
          url: enhancedImageUrl
        };
      } else {
        console.error(`OpenAI custom enhancement failed for image ${imageId}:`, result.error);
        return { success: false, error: `Custom enhancement failed: ${result.error}` };
      }
    }

    console.log('No enhancement type selected, returning original image.');
    // Fallback: return original image
    return {
      success: true,
      id: imageId,
      url: `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3KeyOriginal}`,
      enhanced: false
    };

  } catch (error) {
    console.error('Enhancement error in enhanceImage:', error.response ? error.response.data : error.message, error.stack);
    let errorMessage = 'An unknown error occurred during image enhancement.';
    if (error.name === 'NoSuchKey') {
      errorMessage = `Original image not found in S3: ${imageId}.`;
    } else if (error.message.includes('Failed to upload enhanced image to S3')) {
      errorMessage = `Failed to upload enhanced image to S3: ${error.message}.`;
    } else if (error.message.includes('OpenAI')) {
      errorMessage = `OpenAI processing error: ${error.message}.`;
    }
    return {
      success: false,
      error: errorMessage
    };
  }
}

async function enhanceWithOpenAI(imagePath, prompt) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('Attempting OpenAI enhancement for:', { imagePath, prompt });
    // Assuming imagePath is now an S3 key, we need to fetch the image from S3
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const getObjectParams = {
      Bucket: S3_BUCKET_NAME,
      Key: imagePath,
    };
    let Body;
    try {
      ({ Body } = await s3Client.send(new GetObjectCommand(getObjectParams)));
    } catch (s3Error) {
      console.error(`Error fetching image from S3 (${imagePath}):`, s3Error);
      return { success: false, error: `Failed to retrieve original image from storage: ${s3Error.message}` };
    }

    const imageBuffer = await Body.transformToByteArray();
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 1024, height: 1024, fit: sharp.fit.inside, withoutEnlargement: true })
      .toFormat('jpeg')
      .toBuffer();
    const base64Image = resizedImageBuffer.toString('base64');
    console.log(`Image read from S3: ${imagePath}, base64 length: ${base64Image.length}`);

    console.log('Calling OpenAI chat completions (gpt-4o)...');
    let chatCompletionResponse;
    try {
      chatCompletionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt }, // This 'prompt' now contains the combined prompt
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          },
        ],
      });
    } catch (openaiChatError) {
      console.error('Error calling OpenAI chat completions:', openaiChatError.response ? openaiChatError.response.data : openaiChatError.message);
      return { success: false, error: `OpenAI chat completion failed: ${openaiChatError.message}` };
    }
    console.log('OpenAI chat completions response received.');

    const generatedText = chatCompletionResponse.choices[0].message.content;
    if (!generatedText) {
      console.error('OpenAI chat completions returned no content.');
      return { success: false, error: 'OpenAI chat completions returned empty content for image generation prompt.' };
    }
    console.log('OpenAI GPT-4o response text:', generatedText);

    console.log('Calling OpenAI image generation (dall-e-3)...');
    let imageGenerationResponse;
    try {
      imageGenerationResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: generatedText,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });
    } catch (openaiImageError) {
      console.error('Error calling OpenAI image generation:', openaiImageError.response ? openaiImageError.response.data : openaiImageError.message);
      return { success: false, error: `OpenAI image generation failed: ${openaiImageError.message}` };
    }
    console.log('OpenAI DALL-E 3 image generation response received.');

    const enhancedImageBase64 = imageGenerationResponse.data[0].b64_json;
    const enhancedImageBuffer = Buffer.from(enhancedImageBase64, 'base64');
    console.log('OpenAI DALL-E 3 image generated successfully.');

    return {
      success: true,
      imageBuffer: enhancedImageBuffer
    };
  } catch (error) {
    console.error('OpenAI enhancement error in enhanceWithOpenAI:', error.response ? error.response.data : error.message, error.stack);
    return {
      success: false,
      error: `An unexpected error occurred during OpenAI enhancement: ${error.message}`
    };
  }
}

module.exports = { enhanceImage };