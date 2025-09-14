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

  try {
    const { filename, contentType } = req.body;
    
    console.log('Generating upload URL for:', { filename, contentType });

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Generar nombre único manteniendo extensión
    const extension = filename.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const jsonResponse = await handleUpload({
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log('Generating token for:', pathname);
        
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
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('Upload URL generated successfully');

    return res.status(200).json({
      ...jsonResponse,
      uniqueFilename,
      originalFilename: filename
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'Failed to generate upload URL'
    });
  }
}