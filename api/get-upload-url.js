import { handleUpload } from '@vercel/blob/client';

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
    console.log('🚀 Iniciando handleUpload para upload directo...');

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN is not set in environment');
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // handleUpload() espera el Request object completo con FormData
    // El cliente debe enviar FormData con el archivo
    console.log('🔍 Content-Type:', req.headers['content-type']);

    const jsonResponse = await handleUpload({
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log('🔍 Generating token for:', pathname);
        console.log('🔍 Client payload:', clientPayload);

        // Validaciones opcionales aquí
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('✅ Upload completed:', blob.url);
        // Aquí puedes guardar metadata en tu DB si necesitas
      },
    });

    console.log('✅ handleUpload response:', jsonResponse);
    return res.json(jsonResponse);

  } catch (error) {
    console.error('💥 Error en handleUpload:', error);
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);

    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.name,
      timestamp: new Date().toISOString()
    });
  }
}