import { handleUpload } from '@vercel/blob/client';

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

  // 👇 Agrega este bloque para parsear el body si es necesario
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
  }

  // Adaptar body al formato esperado por handleUpload si es necesario
  // CAMBIO: Usar el evento correcto para obtener la URL de subida directa
  if (!body.type) {
    body = {
      type: 'blob.upload.create-url', // <-- evento correcto para obtener upload URL
      payload: {
        filename: body.filename,
        contentType: body.contentType
      }
    };
  }

  try {
    const { filename, contentType } = body.payload;
    
    console.log('Request body:', body);
    console.log('Generating upload URL for:', { filename, contentType });

    if (!filename) {
      console.error('Missing filename in request');
      return res.status(400).json({ error: 'Filename is required' });
    }
    if (!contentType) {
      console.error('Missing contentType in request');
      return res.status(400).json({ error: 'contentType is required' });
    }

    // Generar nombre único manteniendo extensión
    const extension = filename.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('Generated unique filename:', uniqueFilename);

    // TEMP: Verifica si el token está presente
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is missing!');
      return res.status(500).json({
        error: 'BLOB_READ_WRITE_TOKEN is missing in environment variables',
        details: 'Check your Vercel environment variable configuration.'
      });
    } else {
      console.log('BLOB_READ_WRITE_TOKEN exists');
    }

    // Llama a handleUpload y valida la respuesta
    let jsonResponse;
    try {
      jsonResponse = await handleUpload({
        request: req,
        body, // <-- ahora se pasa el body adaptado correctamente
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          console.log('Generating token for pathname:', pathname);
          console.log('Client payload:', clientPayload);
          return {
            allowedContentTypes: [
              'video/mp4',
              'video/webm',
              'video/mov',
              'video/avi',
              'video/quicktime',
              'video/x-msvideo'
            ],
            maximumSizeInBytes: 100 * 1024 * 1024, // 100MB para videos largos
            tokenPayload: {
              userId: 'pet-video-user',
              originalFilename: filename,
              timestamp: Date.now()
            },
          };
        },
        onUploadCompleted: async (payload) => {
          // Puedes guardar info en tu base de datos aquí si lo deseas
          console.log('Upload completed payload:', payload);
        },
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (err) {
      console.error('handleUpload threw error:', err);
      return res.status(500).json({
        error: err.message || 'handleUpload failed',
        details: 'handleUpload threw an exception'
      });
    }

    if (!jsonResponse || typeof jsonResponse !== 'object' || !jsonResponse.url) {
      console.error('handleUpload did not return a valid response:', jsonResponse);
      return res.status(500).json({
        error: 'handleUpload failed',
        details: 'No valid upload URL generated',
        debug: jsonResponse
      });
    }

    console.log('Upload URL generated successfully');

    return res.status(200).json({
      url: jsonResponse.url, // <-- asegúrate de exponer la URL de subida
      uniqueFilename,
      originalFilename: filename
      // Puedes incluir otros campos si lo necesitas
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'Failed to generate upload URL'
    });
  }
}