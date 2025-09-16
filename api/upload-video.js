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
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    console.log('🔍 Upload request body:', JSON.stringify(body, null, 2));

    const { filename, contentType, originalFilename, fileSize, videoMetadata } = body || {};
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Missing filename or contentType' });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Generar nombre único manteniendo la extensión
    const extension = filename.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('🔍 Generating upload URL for:', { uniqueFilename, contentType });

    // Generar URL de subida firmada (pública) para uploads directos desde el cliente
    const { url, token } = await generateUploadUrl(uniqueFilename, {
      contentType,
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ Upload URL generated successfully');

    return res.status(200).json({
      success: true,
      url,
      uploadUrl: url,
      uploadToken: token,
      filePath: uniqueFilename,
      originalName: originalFilename || filename,
      type: contentType,
      fileSize: fileSize || 0,
      videoMetadata: videoMetadata || {}
    });
  } catch (error) {
    console.error('💥 Error en upload endpoint:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}