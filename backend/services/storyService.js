const fs = require('fs/promises');
const path = require('path');
const OpenAI = require('openai');

async function generateStory(imageId, drawingDescription) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
    const enhancedDir = path.join(process.cwd(), 'tmp', 'enhanced');

    let imagePath = null;

    // Check if the image is in the enhanced directory first
    const enhancedFiles = await fs.readdir(enhancedDir);
    const enhancedFile = enhancedFiles.find(file => file.startsWith(imageId));
    if (enhancedFile) {
      imagePath = path.join(enhancedDir, enhancedFile);
    } else {
      // If not in enhanced, check the uploads directory
      const uploadFiles = await fs.readdir(uploadDir);
      const uploadFile = uploadFiles.find(file => file.startsWith(imageId));
      if (uploadFile) {
        imagePath = path.join(uploadDir, uploadFile);
      }
    }

    if (!imagePath) {
      throw new Error(`Image not found for ID: ${imageId}`);
    }

    const imageBuffer = await fs.readFile(imagePath);
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