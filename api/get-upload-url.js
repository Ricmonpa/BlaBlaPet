import { handleUpload } from '@vercel/blob/client';
import formidable from 'formidable';

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

    // Parsear FormData usando formidable
    console.log('📋 Parseando FormData con formidable...');
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true
    });

    const [fields, files] = await form.parse(req);
    console.log('📋 Fields parsed:', fields);
    console.log('📋 Files parsed:', files);

    // Extraer el archivo y metadata
    const file = files.file?.[0];
    const metadataString = fields.metadata?.[0];
    
    if (!file) {
      console.error('❌ No se encontró archivo en el FormData');
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('📁 Archivo extraído:', {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size
    });

    // Parsear metadata si existe
    let metadata = {};
    if (metadataString) {
      try {
        metadata = JSON.parse(metadataString);
        console.log('📋 Metadata parseada:', metadata);
      } catch (error) {
        console.warn('⚠️ Error parseando metadata:', error.message);
      }
    }

    // Verificar si handleUpload existe antes de usarlo
    console.log('🔍 Verificando disponibilidad de handleUpload...');
    console.log('🔍 handleUpload type:', typeof handleUpload);
    
    // Generar token temporal para upload directo usando handleUpload
    // handleUpload() espera un File object del FormData
    console.log('🚀 Llamando handleUpload con File object...');
    
    const { token, url } = await handleUpload(file, {
      access: 'public'
    });

    console.log('✅ Signed URL generada exitosamente');
    console.log('🔗 URL:', url);

    // Preparar metadata para guardar después del upload
    const videoMetadata = {
      id: file.originalFilename.split('.')[0],
      filename: file.originalFilename,
      contentType: file.mimetype,
      metadata: metadata || {},
      uploadUrl: url,
      createdAt: new Date().toISOString(),
      status: 'uploading'
    };

    return res.status(200).json({
      success: true,
      uploadUrl: url,
      token: token,
      filename: file.originalFilename,
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