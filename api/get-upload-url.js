import { put, generateUploadUrl } from '@vercel/blob';

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

    // Validar que fileSize esté presente y sea un número válido
    if (!fileSize || isNaN(fileSize) || fileSize <= 0) {
      return res.status(400).json({ 
        error: 'fileSize is required and must be a positive number',
        received: { filename, contentType, fileSize }
      });
    }

    // Generar nombre único para el archivo
    const extension = filename.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('🔍 Creating signed URL for:', { uniqueFilename, contentType, fileSize });

    // Convertir fileSize a número y validar
    const fileSizeNumber = parseInt(fileSize);
    if (isNaN(fileSizeNumber) || fileSizeNumber <= 0) {
      return res.status(400).json({ 
        error: 'Invalid fileSize: must be a positive integer',
        received: fileSize
      });
    }

    console.log('🔍 Using fileSize for signed URL generation:', fileSizeNumber);

    // SOLUCION CORRECTA: Usar generateUploadUrl() en lugar de put()
    // Esta es la forma CORRECTA de generar signed URLs con Vercel Blob
    const { url, token } = await generateUploadUrl(uniqueFilename, {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // No necesitamos headers manualmente - generateUploadUrl los maneja internamente
    });

    console.log('✅ Signed URL generated successfully:', url);

    return res.status(200).json({
      success: true,
      uploadUrl: url,
      uploadToken: token, // Token para uploads directos
      filename: uniqueFilename,
      contentType: contentType,
      fileSize: fileSizeNumber
    });

  } catch (error) {
    console.error('💥 Error generating signed URL:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}