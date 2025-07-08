const OpenAI = require('openai');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function generateStory(imageId, drawingDescription) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const s3Key = `uploads/${imageId}.jpeg`; // Assuming original images are JPGs for now

    const getObjectParams = {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    };

    const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
    const imageBuffer = Buffer.from(await Body.transformToByteArray());
    const base64Image = imageBuffer.toString('base64');

    const storyPrompt = `Generate a creative and imaginative bedtime story inspired by this drawing. Focus on the main elements and characters in the image. ${drawingDescription ? `Also, incorporate the following idea: ${drawingDescription}.` : ''} The story should be child-friendly, positive, and have a clear beginning, middle, and end.`;

    console.log(`Generating story for image ${imageId} with prompt: ${storyPrompt}`);

    const chatCompletionResponse = await openai.chat.completions.create({
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

    const generatedStory = chatCompletionResponse.choices[0].message.content;
    console.log('Generated Story:', generatedStory);

    return generatedStory;
  } catch (error) {
    console.error('Error generating story:', error.response ? error.response.data : error.message);
    throw new Error(`Failed to generate story: ${error.message}`);
  }
}

module.exports = {
  generateStory,
};