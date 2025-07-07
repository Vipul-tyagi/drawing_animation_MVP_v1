const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Define the base prompt for stylization
const BASE_STYLIZE_PROMPT = 'Transform this child’s drawing into a hyper-realistic, cinematic 3D render as if it were captured through a high-end film camera in the real world. Every detail of the original drawing must be preserved with absolute fidelity — including all imperfections, unusual proportions, crooked lines, lopsided features, exaggerated expressions, and imaginative distortions. Do not clean up, beautify, or refine any part of the artwork — maintain the raw spontaneity and creative quirks exactly as they appear.Render the figures and objects using ultra-realistic materials: soft, lifelike skin; fuzzy felt or fabric textures for clothing; wispy natural hair; realistically shaded fur for animals; and aged, weathered wood for houses or structures. Integrate accurate physical lighting, directional shadows, and cinematic depth of field — as required to highlight the objects and scenes and shot with a full-frame lens.Place the entire scene in a visually appropriate setting that matches the tone and vibe of the child’s imagination — playful, whimsical, and slightly surreal. The final image should feel like a movie still or a high-budget CGI frame — photorealistic, emotionally rich, and deeply faithful to the original hand-drawn story.';

async function enhanceImage(imageId, enhancementType, prompt) {
  console.log('enhanceImage called with:', { imageId, enhancementType, prompt });
  try {
    const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
    const enhancedDir = path.join(process.cwd(), 'tmp', 'enhanced');

    // Ensure directories exist
    await fs.ensureDir(uploadDir);
    await fs.ensureDir(enhancedDir);

    const outputId = uuidv4();
    const outputPath = path.join(enhancedDir, `${outputId}.png`);

    // Find the correct input file
    const files = await fs.readdir(uploadDir);
    console.log(`Searching for image ID ${imageId} in ${uploadDir}. Files found: ${files.join(', ')}`);
    const inputFile = files.find(file => file.startsWith(imageId));
    const actualInputPath = inputFile ? path.join(uploadDir, inputFile) : null;

    const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']; // Define possibleExtensions

    if (!actualInputPath) {
      throw new Error(`Input image not found for ID: ${imageId}. Checked in ${uploadDir} with extensions ${possibleExtensions.join(', ')}`);
    }

    if (enhancementType === 'stylize') {
      console.log('Enhancement type: stylize');
      // For 'stylize', use the predefined base prompt
      const result = await enhanceWithOpenAI(actualInputPath, BASE_STYLIZE_PROMPT);
      if (result.success) {
        const outputId = uuidv4();
        const s3Key = `enhanced/${outputId}.png`; // S3 key for the enhanced image

        // Upload to S3
        const uploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: s3Key,
          Body: result.imageBuffer,
          ContentType: 'image/png',
          ACL: 'public-read', // Make the object publicly readable
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Enhanced image uploaded to S3: s3://${S3_BUCKET_NAME}/${s3Key}`);

        return {
          success: true,
          id: outputId,
          url: `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`
        };
      } else {
        console.error('OpenAI stylize enhancement failed:', result.error);
        return result;
      }
    } else if (enhancementType === 'custom' && prompt) {
      console.log('Enhancement type: custom');
      // Combine the base prompt with the user's custom prompt for 'custom' enhancement
      // The user's prompt will add specific details to the base stylization instructions.
      const combinedPrompt = `${BASE_STYLIZE_PROMPT}

User's specific request: ${prompt}`;

      const result = await enhanceWithOpenAI(actualInputPath, combinedPrompt);
      if (result.success) {
        const outputId = uuidv4();
        const s3Key = `enhanced/${outputId}.png`; // S3 key for the enhanced image

        // Upload to S3
        const uploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: s3Key,
          Body: result.imageBuffer,
          ContentType: 'image/png',
          ACL: 'public-read', // Make the object publicly readable
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Enhanced image uploaded to S3: s3://${S3_BUCKET_NAME}/${s3Key}`);

        return {
          success: true,
          id: outputId,
          url: `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`
        };
      } else {
        console.error('OpenAI custom enhancement failed:', result.error);
        return result;
      }
    }

    console.log('No enhancement type selected, returning original image.');
    // Fallback: return original image
    return {
      success: true,
      id: imageId,
      url: `/uploads/${path.basename(actualInputPath)}`,
      enhanced: false
    };

  } catch (error) {
    console.error('Enhancement error in enhanceImage:', error.message, error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

async function enhanceWithOpenAI(imagePath, prompt) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('Attempting OpenAI enhancement for:', { imagePath, prompt });
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log(`Image read from ${imagePath}, base64 length: ${base64Image.length}`);

    console.log('Calling OpenAI chat completions (gpt-4o)...');
    const chatCompletionResponse = await openai.chat.completions.create({
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
    console.log('OpenAI chat completions response received.');

    const generatedText = chatCompletionResponse.choices[0].message.content;
    console.log('OpenAI GPT-4o response text:', generatedText);

    console.log('Calling OpenAI image generation (dall-e-3)...');
    const imageGenerationResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: generatedText,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
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
      error: error.message
    };
  }
}

module.exports = { enhanceImage };
