import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filename: (name, ext, part) => {
      return `${uuidv4()}${ext}`;
    },
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${path.basename(file.filepath)}`;
    const imageId = path.basename(file.filepath, path.extname(file.filepath));

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      id: imageId,
      url: imageUrl,
      fileName: file.originalFilename,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'File upload failed' });
  }
}