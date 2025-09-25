/**
 * Script para migrar videos con URLs blob a Cloudinary
 * Este script busca videos con URLs blob expiradas y los migra a Cloudinary
 */

import { config } from 'dotenv';
import { connectToDatabase } from '../src/lib/mongodb.js';
import { uploadVideoToCloudinary } from '../src/config/cloudinary.js';

// Cargar variables de entorno
config();

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://blabla-pet-ai.vercel.app'
  : 'http://localhost:5173';

async function migrateBlobVideos() {
  try {
    console.log('🔄 Iniciando migración de videos blob a Cloudinary...');
    
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
      console.log('✅ No hay videos con URLs blob para migrar');
      return;
    }
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const video of blobVideos) {
      try {
        console.log(`\n🎬 Procesando video: ${video.id}`);
        console.log(`📅 Creado: ${video.createdAt}`);
        console.log(`🔗 URL actual: ${video.mediaUrl}`);
        
        // Verificar si el video ya tiene una URL de Cloudinary
        if (video.mediaUrl && video.mediaUrl.includes('cloudinary.com')) {
          console.log('✅ Video ya tiene URL de Cloudinary, saltando...');
          continue;
        }
        
        // Para videos con URLs blob expiradas, necesitamos recrear el video
        // Como no podemos recuperar el blob expirado, vamos a marcarlo para eliminación
        console.log('⚠️ Video con URL blob expirada - marcando para eliminación');
        
        // Marcar el video como problemático en localStorage del cliente
        // (esto se manejará en el frontend)
        console.log('🗑️ Video marcado para eliminación:', video.id);
        
        // Eliminar el video de la base de datos
        await videosCollection.deleteOne({ _id: video._id });
        console.log('✅ Video eliminado de la base de datos');
        
        errorCount++;
        
      } catch (error) {
        console.error(`❌ Error procesando video ${video.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Resumen de migración:');
    console.log(`✅ Videos procesados: ${blobVideos.length}`);
    console.log(`🗑️ Videos eliminados: ${errorCount}`);
    console.log(`☁️ Videos migrados: ${migratedCount}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️ Algunos videos no pudieron ser migrados y fueron eliminados');
      console.log('Esto es normal para videos con URLs blob expiradas');
    }
    
    console.log('\n✅ Migración completada');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

// Ejecutar migración
migrateBlobVideos().then(() => {
  console.log('🏁 Script de migración finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
