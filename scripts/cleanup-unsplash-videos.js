/**
 * Script para limpiar videos con URLs de Unsplash de la base de datos
 */

import { list, del } from '@vercel/blob';

async function cleanupUnsplashVideos() {
  try {
    console.log('🧹 Iniciando limpieza de videos con URLs de Unsplash...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN no está configurado');
      return;
    }

    // Listar todos los metadatos de videos
    const blobs = await list({
      prefix: 'videos/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`📋 Encontrados ${blobs.blobs.length} archivos de metadatos`);

    let deletedCount = 0;
    const videosToDelete = [];

    // Revisar cada archivo de metadatos
    for (const blob of blobs.blobs) {
      try {
        const response = await fetch(blob.url);
        if (response.ok) {
          const video = await response.json();
          
          // Verificar si tiene URL de Unsplash
          if (video.mediaUrl && video.mediaUrl.includes('unsplash.com')) {
            console.log(`🗑️ Video con Unsplash encontrado: ${video.id}`);
            videosToDelete.push(blob.pathname);
            deletedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando ${blob.pathname}:`, error.message);
      }
    }

    // Eliminar videos con URLs de Unsplash
    for (const pathname of videosToDelete) {
      try {
        await del(pathname, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        console.log(`✅ Eliminado: ${pathname}`);
      } catch (error) {
        console.error(`❌ Error eliminando ${pathname}:`, error.message);
      }
    }

    console.log(`🎉 Limpieza completada. ${deletedCount} videos eliminados.`);
    
  } catch (error) {
    console.error('💥 Error en limpieza:', error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupUnsplashVideos();
}

export default cleanupUnsplashVideos;
