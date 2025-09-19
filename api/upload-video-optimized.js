import { put } from '@vercel/blob';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for multipart/form-data
  },
  maxDuration: 300, // 5 minutos para videos largos
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-content-length');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Iniciando upload optimizado de video...');
    console.log('📋 Headers recibidos:', req.headers);
    console.log('📏 x-content-length:', req.headers['x-content-length']);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Parse FormData using formidable con configuración optimizada para videos largos
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max (reducido para evitar límites)
      keepExtensions: true,
      maxFields: 20, // Permitir más campos de metadata
      maxFieldsSize: 20 * 1024 * 1024, // 20MB para metadata
    });

    const [fields, files] = await form.parse(req);
    
    console.log('📁 Archivos recibidos:', Object.keys(files));
    console.log('📋 Campos recibidos:', Object.keys(fields));

    // Get video file
    const videoFile = files.video?.[0];
    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Validar duración máxima por tamaño de archivo (aproximado)
    const fileSizeMB = videoFile.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      return res.status(400).json({ 
        error: 'Video file too large. Maximum size: 100MB (approximately 5 minutes)',
        receivedSize: `${fileSizeMB.toFixed(2)}MB`
      });
    }

    console.log('🎬 Procesando video:', {
      name: videoFile.originalFilename,
      size: videoFile.size,
      sizeMB: `${fileSizeMB.toFixed(2)}MB`,
      type: videoFile.mimetype,
      path: videoFile.filepath
    });

    // Read file content
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(videoFile.filepath);
    
    // Generate unique filename
    const extension = videoFile.originalFilename?.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('📤 Subiendo a Vercel Blob:', uniqueFilename);

    // Upload directly to Vercel Blob
    const { url } = await put(uniqueFilename, fileBuffer, {
      access: 'public',
      contentType: videoFile.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });

    console.log('✅ Video subido exitosamente:', url);

    // Clean up temporary file
    try {
      fs.unlinkSync(videoFile.filepath);
    } catch (cleanupError) {
      console.warn('⚠️ Error limpiando archivo temporal:', cleanupError);
    }

    // Get metadata from fields
    const metadata = {
      petName: fields.petName?.[0] || 'Video Subido',
      translation: fields.translation?.[0] || 'Análisis completado',
      emotionalDubbing: fields.emotionalDubbing?.[0] || '',
      subtitles: fields.subtitles ? JSON.parse(fields.subtitles[0]) : [],
      totalDuration: fields.totalDuration?.[0] || 0,
      userId: fields.userId?.[0] || 'uploaded_user',
      isPublic: fields.isPublic?.[0] !== 'false',
    };

    // Save video metadata to database
    const now = new Date().toISOString();
    const videoMetadata = {
      id: uniqueFilename.split('.')[0],
      ...metadata,
      mediaUrl: url,
      mediaType: 'video',
      thumbnailUrl: url, // Use video URL as thumbnail for now
      createdAt: now,
      updatedAt: now,
      shareCount: 0,
      likeCount: 0,
      commentCount: 0,
      metadata: {
        fileSize: videoFile.size,
        fileSizeMB: fileSizeMB,
        format: extension,
        originalName: videoFile.originalFilename,
        uploadMethod: 'optimized_upload', // Indicar que fue upload optimizado
      }
    };

    // Save metadata to Vercel Blob database
    const metadataKey = `videos/${videoMetadata.id}.json`;
    await put(
      metadataKey,
      JSON.stringify(videoMetadata),
      {
        access: 'public',
        contentType: 'application/json',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

    console.log('💾 Metadata guardada en base de datos:', videoMetadata.id);

    return res.status(200).json({
      success: true,
      url: url,
      filename: uniqueFilename,
      metadata: videoMetadata,
      uploadMethod: 'optimized_upload',
      message: 'Video uploaded and saved successfully (supports up to 5 minutes)'
    });

  } catch (error) {
    console.error('💥 Error en upload optimizado:', error);
    
    // Mejor manejo de errores específicos
    if (error.message?.includes('Request Entity Too Large')) {
      return res.status(413).json({ 
        error: 'Video file too large. Maximum size: 100MB (approximately 5 minutes)',
        details: 'Try compressing your video or reducing its duration.',
        uploadMethod: 'optimized_upload'
      });
    }
    
    if (error.message?.includes('timeout')) {
      return res.status(408).json({ 
        error: 'Upload timeout. Video might be too large or network connection is slow.',
        details: 'Try compressing your video or check your internet connection.',
        uploadMethod: 'optimized_upload'
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack,
      uploadMethod: 'optimized_upload'
    });
  }
}
