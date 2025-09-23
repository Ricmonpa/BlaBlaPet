import formidable from 'formidable';
import { uploadVideoToCloudinary } from '../src/config/cloudinary.js';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for multipart/form-data
  },
  maxDuration: 300, // 5 minutos para videos largos
};

export default async function handler(req, res) {
  console.log('🎯 CLOUDINARY UPLOAD - Method:', req.method);
  console.log('🎯 CLOUDINARY UPLOAD - URL:', req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-content-length');

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Iniciando upload a Cloudinary...');
    console.log('⏰ Timestamp inicio:', new Date().toISOString());

    // Verificar variables de entorno de Cloudinary
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ 
        error: 'Cloudinary configuration is missing. Please set REACT_APP_CLOUDINARY_CLOUD_NAME, REACT_APP_CLOUDINARY_API_KEY, and REACT_APP_CLOUDINARY_API_SECRET in environment variables.' 
      });
    }

    // Parse FormData using formidable
    console.log('📝 Configurando formidable...');
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB max (Cloudinary soporta videos más grandes)
      keepExtensions: true,
      maxFields: 20,
      maxFieldsSize: 20 * 1024 * 1024,
    });

    console.log('🔄 Iniciando parsing de FormData...');
    const [fields, files] = await form.parse(req);
    
    console.log('✅ FormData parseado exitosamente');
    console.log('📁 Archivos recibidos:', Object.keys(files));
    console.log('📋 Campos recibidos:', Object.keys(fields));

    // Get video file
    const videoFile = files.video?.[0];
    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Validar tamaño del archivo
    const fileSizeMB = videoFile.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      return res.status(400).json({ 
        error: 'Video file too large. Maximum size: 100MB',
        receivedSize: `${fileSizeMB.toFixed(2)}MB`,
        suggestion: 'Please compress your video or reduce its duration.'
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
    console.log('📖 Leyendo archivo...');
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(videoFile.filepath);
    
    console.log('✅ Archivo leído exitosamente, tamaño:', fileBuffer.length, 'bytes');
    
    // Upload to Cloudinary
    console.log('📤 Subiendo a Cloudinary...');
    console.log('⏰ Timestamp antes de upload:', new Date().toISOString());

    const uploadResult = await uploadVideoToCloudinary(fileBuffer, {
      // Opciones adicionales para Cloudinary
      tags: ['yo-pett', 'video', 'pet'],
      context: {
        alt: fields.petName?.[0] || 'Pet Video',
        caption: fields.translation?.[0] || 'Pet video with AI analysis'
      }
    });
    
    console.log('✅ Upload a Cloudinary exitoso');
    console.log('⏰ Timestamp después de upload:', new Date().toISOString());
    console.log('🔗 URL del video:', uploadResult.url);

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
      isSequentialSubtitles: fields.isSequentialSubtitles?.[0] === 'true',
      userId: fields.userId?.[0] || 'uploaded_user',
      isPublic: fields.isPublic?.[0] !== 'false',
    };

    // Create video metadata object
    const now = new Date().toISOString();
    const videoMetadata = {
      id: uploadResult.publicId,
      ...metadata,
      mediaUrl: uploadResult.url,
      mediaType: 'video',
      thumbnailUrl: uploadResult.eager?.[0]?.secure_url || uploadResult.url, // Usar thumbnail generado
      createdAt: now,
      updatedAt: now,
      shareCount: 0,
      likeCount: 0,
      commentCount: 0,
      cloudinary: {
        publicId: uploadResult.publicId,
        assetId: uploadResult.assetId,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        bytes: uploadResult.bytes
      },
      metadata: {
        fileSize: videoFile.size,
        fileSizeMB: fileSizeMB,
        format: videoFile.originalFilename?.split('.').pop() || 'mp4',
        originalName: videoFile.originalFilename,
        uploadMethod: 'cloudinary_upload'
      }
    };

    console.log('💾 Metadata del video:', videoMetadata.id);

    return res.status(200).json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      filename: videoFile.originalFilename,
      metadata: videoMetadata,
      uploadMethod: 'cloudinary_upload',
      cloudinary: {
        publicId: uploadResult.publicId,
        assetId: uploadResult.assetId,
        format: uploadResult.format,
        duration: uploadResult.duration,
        thumbnails: uploadResult.eager
      },
      message: 'Video uploaded to Cloudinary successfully'
    });

  } catch (error) {
    console.error('💥 Error en upload a Cloudinary:', error);
    
    if (error.message?.includes('Request Entity Too Large')) {
      return res.status(413).json({ 
        error: 'Video file too large. Maximum size: 100MB',
        details: 'Try compressing your video or reducing its duration.',
        uploadMethod: 'cloudinary_upload'
      });
    }
    
    if (error.message?.includes('timeout')) {
      return res.status(408).json({ 
        error: 'Upload timeout. Video might be too large or network connection is slow.',
        details: 'Try compressing your video or check your internet connection.',
        uploadMethod: 'cloudinary_upload'
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack,
      uploadMethod: 'cloudinary_upload'
    });
  }
}
