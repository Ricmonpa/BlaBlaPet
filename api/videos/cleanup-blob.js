/**
 * API Endpoint para limpiar videos con URLs blob expiradas
 * DELETE /api/videos/cleanup-blob
 */

import { connectToDatabase } from '../../src/lib/mongodb.js';

export default async function handler(req, res) {
  // Solo permitir método DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Solo se permite DELETE'
    });
  }

  try {
    console.log('🧹 Iniciando limpieza de videos con URLs blob expiradas...');
    
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
        message: 'No hay videos con URLs blob para limpiar',
        deletedCount: 0
      });
    }
    
    // Eliminar videos con URLs blob
    const deleteResult = await videosCollection.deleteMany({
      $or: [
        { mediaUrl: { $regex: /^blob:/ } },
        { thumbnailUrl: { $regex: /^blob:/ } }
      ]
    });
    
    console.log(`✅ Eliminados ${deleteResult.deletedCount} videos con URLs blob`);
    
    return res.status(200).json({
      success: true,
      message: `Limpieza completada: ${deleteResult.deletedCount} videos eliminados`,
      deletedCount: deleteResult.deletedCount,
      details: {
        blobVideosFound: blobVideos.length,
        videosDeleted: deleteResult.deletedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error en cleanup de videos blob:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
      details: 'Error limpiando videos con URLs blob expiradas'
    });
  }
}
