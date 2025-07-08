import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await axios.post(`${backendUrl}/api/enhance`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding enhancement request to backend:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, error: 'Failed to connect to backend enhancement service' });
    }
  }
}