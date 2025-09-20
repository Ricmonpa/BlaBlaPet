import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  console.log('🎯 ENDPOINT get-upload-url - Method:', req.method);
  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
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
    console.log('🚀 Iniciando generación de signed URL para upload directo...');
    console.log('🔍 Verificando variables de entorno...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN is not set in environment');
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }
    
    console.log('✅ Variables de entorno verificadas');

    // Obtener metadata del request
    const { fileName, contentType, metadata } = req.body;
    console.log('📋 Parámetros recibidos:', { fileName, contentType, metadata });
    
    // Validar parámetros requeridos
    if (!fileName || !contentType) {
      console.error('❌ Parámetros faltantes:', { fileName, contentType });
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

    // Verificar si handleUpload existe antes de usarlo
    console.log('🔍 Verificando disponibilidad de handleUpload...');
    console.log('🔍 handleUpload type:', typeof handleUpload);
    
    // Generar token temporal para upload directo usando handleUpload
    // handleUpload() espera el request completo del cliente, no parámetros individuales
    console.log('🚀 Llamando handleUpload con request del cliente...');
    console.log('🔍 Request completo:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });
    
    const { token, url } = await handleUpload(req);

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
      token: token,
      filename: uniqueFilename,
      metadata: videoMetadata,
      message: 'Token generated for direct upload'
    });

  } catch (error) {
    console.error('💥 Error generando signed URL:', error);
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Error details:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack,
      errorName: error.name,
      timestamp: new Date().toISOString()
    });
  }
}