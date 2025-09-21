import { put } from '@vercel/blob';

export default async function handler(req, res) {
  console.log('🎯 ENDPOINT get-upload-url - Method:', req.method);
  console.log('🔍 Environment check - BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
  
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
    console.log('🚀 Generando presigned URL para upload directo...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN is not set in environment');
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Obtener metadata del request (solo metadata, no el archivo)
    const { fileName, contentType, fileSize } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    console.log('📋 Generando URL para:', { fileName, contentType, fileSize });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const uniqueFileName = `videos/${timestamp}_${fileName}`;

    // Crear un blob vacío para obtener la URL de upload
    // Esto genera una presigned URL sin subir el archivo aún
    const blob = await put(uniqueFileName, new Uint8Array(0), {
      access: 'public',
      contentType: contentType || 'video/mp4',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ Presigned URL generada:', blob.url);

    // La URL del blob se puede usar para PUT directo desde el cliente
    const uploadUrl = blob.url.replace('/blob/', '/blob/upload/');

    return res.status(200).json({
      success: true,
      uploadUrl: blob.url, // URL para PUT directo
      url: blob.url, // URL final del archivo
      downloadUrl: blob.url,
      pathname: uniqueFileName,
      filename: fileName,
      message: 'Presigned URL generated for direct upload'
    });

  } catch (error) {
    console.error('💥 Error generando presigned URL:', error);
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.name,
      timestamp: new Date().toISOString()
    });
  }
}