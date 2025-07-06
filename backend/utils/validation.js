const sharp = require('sharp');

async function validateImage(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    if (metadata.width > 0 && metadata.height > 0) {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid image dimensions' };
  } catch (error) {
    return { valid: false, error: 'Not a valid image file' };
  }
}

module.exports = { validateImage };
