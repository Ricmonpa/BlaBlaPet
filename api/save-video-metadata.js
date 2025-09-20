import { put } from '@vercel/blob';

export default async function handler(req, res) {
  console.log('🎯 ENDPOINT save-video-metadata - Method:', req.method);
  
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
    console.log('💾 Guardando metadata del video...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Obtener metadata del request
    const { 
      filename, 
      videoUrl, 
      petName, 
      translation, 
      emotionalDubbing, 
      subtitles, 
      totalDuration, 
      isSequentialSubtitles,
      userId,
      isPublic 
    } = req.body;
    
    // Validar parámetros requeridos
    if (!filename || !videoUrl) {
      return res.status(400).json({ 
        error: 'filename and videoUrl are required' 
      });
    }

    console.log('📝 Guardando metadata para:', filename);
    console.log('🔗 Video URL:', videoUrl);

    // Crear metadata completo del video
    const now = new Date().toISOString();
    const videoMetadata = {
      id: filename.split('.')[0],
      petName: petName || 'Video Subido',
      translation: translation || 'Análisis completado',
      emotionalDubbing: emotionalDubbing || '',
      subtitles: subtitles || [],
      totalDuration: totalDuration || 0,
      isSequentialSubtitles: isSequentialSubtitles || false,
      userId: userId || 'uploaded_user',
      isPublic: isPublic !== false,
      mediaUrl: videoUrl,
      mediaType: 'video',
      thumbnailUrl: videoUrl, // Use video URL as thumbnail for now
      createdAt: now,
      updatedAt: now,
      shareCount: 0,
      likeCount: 0,
      commentCount: 0,
      metadata: {
        filename: filename,
        uploadMethod: 'direct_upload', // Indicar que fue upload directo
        fileSize: 0, // No tenemos el tamaño aquí
        format: filename.split('.').pop() || 'mp4'
      }
    };

    // Guardar metadata en Vercel Blob database
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

    console.log('✅ Metadata guardada en base de datos:', videoMetadata.id);

    return res.status(200).json({
      success: true,
      metadata: videoMetadata,
      message: 'Video metadata saved successfully'
    });

  } catch (error) {
    console.error('💥 Error guardando metadata:', error);
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}
