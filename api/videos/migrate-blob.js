/**
 * API Endpoint para migrar videos blob a Cloudinary
 * POST /api/videos/migrate-blob
 */

import { connectToDatabase } from '../../src/lib/mongodb.js';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Solo se permite POST'
    });
  }

  try {
    console.log('🔄 Iniciando migración de videos blob...');
    
    const { db } = await connectToDatabase();
    const videosCollection = db.collection('videos');
    
    // Buscar videos con URLs blob
    const blobVideos = await videosCollection.find({
      $or: [
        { mediaUrl: { $regex: /^blob:/ } },
        { thumbnailUrl: { $regex: /^blob:/ } }
      ]
    }).toArray();
    
    console.log(`🔍 Encontrados ${blobVideos.length} videos con URLs blob`);
    
    if (blobVideos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay videos con URLs blob para migrar',
        migratedCount: 0,
        deletedCount: 0
      });
    }
    
    let deletedCount = 0;
    
    // Eliminar videos con URLs blob (no se pueden migrar porque están expiradas)
    for (const video of blobVideos) {
      try {
        console.log(`🗑️ Eliminando video con URL blob: ${video.id}`);
        await videosCollection.deleteOne({ _id: video._id });
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error eliminando video ${video.id}:`, error.message);
      }
    }
    
    console.log(`✅ Eliminados ${deletedCount} videos con URLs blob`);
    
    return res.status(200).json({
      success: true,
      message: `Migración completada: ${deletedCount} videos con URLs blob eliminados`,
      migratedCount: 0,
      deletedCount: deletedCount,
      details: {
        blobVideosFound: blobVideos.length,
        videosDeleted: deletedCount,
        note: 'Los videos con URLs blob expiradas no se pueden migrar y fueron eliminados'
      }
    });
    
  } catch (error) {
    console.error('❌ Error en migración de videos blob:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
      details: 'Error migrando videos blob a Cloudinary'
    });
  }
}
