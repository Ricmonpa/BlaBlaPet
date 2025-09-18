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
    console.log('🔍 Generating signed URL for direct upload...');

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    const { filename, contentType, fileSize } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' });
    }

    // Generar nombre único para el archivo
    const extension = filename.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('🔍 Creating signed URL for:', { uniqueFilename, contentType, fileSize });

    // Usar put() correctamente para generar signed URL
    // Para signed URLs, pasamos un Uint8Array vacío como body
    const { url } = await put(uniqueFilename, new Uint8Array(0), {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      // Para signed URLs, Vercel Blob maneja automáticamente los headers
      // No necesitamos especificar x-content-length manualmente
    });

    console.log('✅ Signed URL generated successfully:', url);

    return res.status(200).json({
      success: true,
      uploadUrl: url,
      filename: uniqueFilename,
      contentType: contentType,
      fileSize: fileSize
    });

  } catch (error) {
    console.error('💥 Error generating signed URL:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}