import { put } from '@vercel/blob';

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
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    const { fileName, contentType = 'video/mp4' } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    console.log('🔗 Generating upload URL for:', fileName, 'with type:', contentType);

    // Crear un blob temporal para generar la URL
    const tempBlob = new Blob([''], { type: contentType });
    
    // Generar URL de upload directo al Blob Store
    const blob = await put(fileName, tempBlob, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ Generated upload URL successfully:', blob.pathname);

    return res.status(200).json({
      uploadUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      url: blob.url, // Para compatibilidad
    });

  } catch (error) {
    console.error('❌ Error generating upload URL:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      fileName: req.body?.fileName,
      contentType: req.body?.contentType
    });
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}