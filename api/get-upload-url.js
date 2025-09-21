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

    console.log('📋 Generando presigned URL para:', { fileName, contentType, fileSize });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const uniqueFileName = `videos/${timestamp}_${fileName}`;

    // Generar presigned URL usando la API de Vercel Blob
    const presignedUrl = `https://blob.vercel-storage.com/${uniqueFileName}?token=${process.env.BLOB_READ_WRITE_TOKEN}`;
    const finalUrl = `https://blob.vercel-storage.com/${uniqueFileName}`;

    console.log('✅ Presigned URL generada:', presignedUrl);

    return res.status(200).json({
      success: true,
      uploadUrl: presignedUrl, // URL para PUT directo
      url: finalUrl, // URL final del archivo
      downloadUrl: finalUrl,
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