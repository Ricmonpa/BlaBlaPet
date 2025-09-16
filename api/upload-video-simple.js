import { generateUploadUrl } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Simple upload - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Simple upload - Token exists:', !!process.env.BLOB_READ_WRITE_TOKEN);

    const { filename, contentType } = req.body;
    
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Missing filename or contentType' });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Generar nombre único
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp4`;

    console.log('🔍 Simple upload - Generating URL for:', uniqueFilename);

    // Generar URL de subida
    const { url, token } = await generateUploadUrl(uniqueFilename, {
      contentType,
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ Simple upload - URL generated successfully');

    return res.status(200).json({
      success: true,
      url,
      uploadUrl: url,
      uploadToken: token,
      filePath: uniqueFilename,
      originalName: filename,
      type: contentType
    });
  } catch (error) {
    console.error('💥 Simple upload - Error:', error);
    console.error('💥 Simple upload - Stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      stack: error.stack
    });
  }
}
