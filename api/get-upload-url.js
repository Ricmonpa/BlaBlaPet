import { put } from '@vercel/blob';

export default async function handler(req, res) {
  console.log('🎯 ENDPOINT get-upload-url - Method:', req.method);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Generando signed URL para upload directo...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Obtener metadata del request
    const { fileName, contentType, metadata } = req.body;
    
    // Validar parámetros requeridos
    if (!fileName || !contentType) {
      return res.status(400).json({ 
        error: 'fileName and contentType are required' 
      });
    }

    // Generar nombre único para el archivo
    const extension = fileName.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('📝 Generando signed URL para:', uniqueFilename);
    console.log('📊 Content-Type:', contentType);
    console.log('📋 Metadata:', metadata);

    // Generar signed URL para upload directo
    // Usamos put() con multipart: true para uploads grandes
    const { url } = await put(uniqueFilename, null, {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      // Habilitar multipart para archivos grandes
      multipart: true
    });

    console.log('✅ Signed URL generada exitosamente');
    console.log('🔗 URL:', url);

    // Preparar metadata para guardar después del upload
    const videoMetadata = {
      id: uniqueFilename.split('.')[0],
      filename: uniqueFilename,
      contentType: contentType,
      metadata: metadata || {},
      uploadUrl: url,
      createdAt: new Date().toISOString(),
      status: 'uploading'
    };

    return res.status(200).json({
      success: true,
      uploadUrl: url,
      filename: uniqueFilename,
      metadata: videoMetadata,
      message: 'Signed URL generated for direct upload'
    });

  } catch (error) {
    console.error('💥 Error generando signed URL:', error);
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}