import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
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
    console.log('🔍 Upload request received');
    console.log('🔍 Request body type:', typeof req.body);
    console.log('🔍 Request body keys:', Object.keys(req.body || {}));

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Obtener el archivo del body
    const { file, filename, contentType } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Generar nombre único
    const extension = filename?.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('🔍 Uploading file:', { uniqueFilename, contentType, size: file.length });

    // Subir directamente a Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: 'public',
      contentType: contentType || 'video/mp4',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ File uploaded successfully:', blob.url);

    return res.status(200).json({
      success: true,
      url: blob.url,
      filePath: uniqueFilename,
      originalName: filename,
      type: contentType,
      size: file.length
    });

  } catch (error) {
    console.error('💥 Error en upload endpoint:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}
