/**
 * Script para probar la carga de videos en el feed
 * Verifica que los videos se carguen correctamente después de la migración
 */

import { config } from 'dotenv';
import { connectToDatabase } from '../src/lib/mongodb.js';

// Cargar variables de entorno
config();

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://blabla-pet-ai.vercel.app'
  : 'http://localhost:5173';

async function testVideoFeed() {
  try {
    console.log('🧪 Probando carga de videos en el feed...');
    
    // 1. Verificar conexión a la base de datos
    console.log('\n1️⃣ Verificando conexión a la base de datos...');
    const { db } = await connectToDatabase();
    const videosCollection = db.collection('videos');
    
    // 2. Contar videos en la base de datos
    console.log('\n2️⃣ Contando videos en la base de datos...');
    const totalVideos = await videosCollection.countDocuments();
    console.log(`📊 Total de videos en la base de datos: ${totalVideos}`);
    
    // 3. Verificar tipos de URLs
    console.log('\n3️⃣ Analizando tipos de URLs...');
    const cloudinaryVideos = await videosCollection.countDocuments({
      $or: [
        { mediaUrl: { $regex: /cloudinary\.com/ } },
        { thumbnailUrl: { $regex: /cloudinary\.com/ } }
      ]
    });
    
    const blobVideos = await videosCollection.countDocuments({
      $or: [
        { mediaUrl: { $regex: /^blob:/ } },
        { thumbnailUrl: { $regex: /^blob:/ } }
      ]
    });
    
    const httpVideos = await videosCollection.countDocuments({
      $or: [
        { mediaUrl: { $regex: /^https?:\/\// } },
        { thumbnailUrl: { $regex: /^https?:\/\// } }
      ]
    });
    
    console.log(`☁️ Videos con URLs de Cloudinary: ${cloudinaryVideos}`);
    console.log(`🔗 Videos con URLs blob: ${blobVideos}`);
    console.log(`🌐 Videos con URLs HTTP/HTTPS: ${httpVideos}`);
    
    // 4. Probar endpoint de migración
    if (blobVideos > 0) {
      console.log('\n4️⃣ Probando migración de videos blob...');
      try {
        const response = await fetch(`${baseUrl}/api/videos/migrate-blob`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Migración exitosa: ${result.deletedCount} videos eliminados`);
        } else {
          console.log(`⚠️ Error en migración: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error probando migración: ${error.message}`);
      }
    } else {
      console.log('\n4️⃣ No hay videos blob para migrar');
    }
    
    // 5. Probar endpoint de cleanup
    console.log('\n5️⃣ Probando cleanup de videos blob...');
    try {
      const response = await fetch(`${baseUrl}/api/videos/cleanup-blob`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Cleanup exitoso: ${result.deletedCount} videos eliminados`);
      } else {
        console.log(`⚠️ Error en cleanup: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error probando cleanup: ${error.message}`);
    }
    
    // 6. Verificar estado final
    console.log('\n6️⃣ Estado final de la base de datos...');
    const finalTotalVideos = await videosCollection.countDocuments();
    const finalBlobVideos = await videosCollection.countDocuments({
      $or: [
        { mediaUrl: { $regex: /^blob:/ } },
        { thumbnailUrl: { $regex: /^blob:/ } }
      ]
    });
    
    console.log(`📊 Videos totales después de limpieza: ${finalTotalVideos}`);
    console.log(`🔗 Videos con URLs blob restantes: ${finalBlobVideos}`);
    
    // 7. Mostrar algunos videos de ejemplo
    console.log('\n7️⃣ Mostrando videos de ejemplo...');
    const sampleVideos = await videosCollection.find({}).limit(3).toArray();
    
    sampleVideos.forEach((video, index) => {
      console.log(`\n📹 Video ${index + 1}:`);
      console.log(`   ID: ${video.id}`);
      console.log(`   Pet Name: ${video.petName}`);
      console.log(`   Media URL: ${video.mediaUrl}`);
      console.log(`   Thumbnail URL: ${video.thumbnailUrl}`);
      console.log(`   Created: ${video.createdAt}`);
    });
    
    console.log('\n✅ Prueba del feed completada');
    
  } catch (error) {
    console.error('❌ Error en prueba del feed:', error);
  }
}

// Ejecutar prueba
testVideoFeed().then(() => {
  console.log('🏁 Script de prueba finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
