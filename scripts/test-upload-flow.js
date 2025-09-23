/**
 * Script para probar el flujo completo de upload con Cloudinary
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno
config();

async function testUploadFlow() {
  console.log('🧪 Probando flujo completo de upload con Cloudinary...');
  
  // Verificar que el servidor esté corriendo
  const baseUrl = 'http://localhost:5173';
  
  try {
    console.log('\n🔍 Verificando que el servidor esté corriendo...');
    const healthCheck = await fetch(`${baseUrl}/`);
    
    if (!healthCheck.ok) {
      throw new Error('Servidor no está corriendo. Ejecuta: npm run dev');
    }
    
    console.log('✅ Servidor está corriendo');
    
    // Buscar un video de prueba
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    let testVideoPath = null;
    
    try {
      const videoFiles = fs.readdirSync(videosDir);
      if (videoFiles.length > 0) {
        testVideoPath = path.join(videosDir, videoFiles[0]);
        console.log('📹 Video de prueba encontrado:', videoFiles[0]);
      }
    } catch (error) {
      console.log('⚠️ No se encontraron videos en public/videos/');
    }
    
    if (!testVideoPath) {
      console.log('\n💡 Para probar uploads reales:');
      console.log('1. Agrega un video a la carpeta public/videos/');
      console.log('2. O usa la cámara en la aplicación web');
      console.log('3. Ve a http://localhost:5173');
      console.log('4. Haz clic en la cámara y graba un video');
      console.log('5. El video se subirá automáticamente a Cloudinary');
      return;
    }
    
    // Crear FormData para simular upload
    console.log('\n📤 Simulando upload a Cloudinary...');
    const videoBuffer = fs.readFileSync(testVideoPath);
    const formData = new FormData();
    
    // Crear un File object simulado
    const videoFile = new File([videoBuffer], path.basename(testVideoPath), {
      type: 'video/mp4'
    });
    
    formData.append('video', videoFile);
    formData.append('petName', 'Mascota de Prueba');
    formData.append('translation', 'Análisis de prueba');
    formData.append('emotionalDubbing', 'Doblaje emocional de prueba');
    formData.append('userId', 'test_user');
    formData.append('isPublic', 'true');
    
    console.log('📁 Archivo preparado:', {
      name: videoFile.name,
      size: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
      type: videoFile.type
    });
    
    // Intentar upload a Cloudinary
    console.log('🚀 Enviando a /api/upload-video-cloudinary...');
    const uploadResponse = await fetch(`${baseUrl}/api/upload-video-cloudinary`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Error en upload:', uploadResponse.status, errorText);
      throw new Error(`Upload falló: ${uploadResponse.status} - ${errorText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload exitoso!');
    console.log('🔗 URL del video:', uploadResult.url);
    console.log('📝 Public ID:', uploadResult.publicId);
    console.log('📊 Metadata:', uploadResult.metadata);
    
    // Probar reproducción del video
    console.log('\n🎬 Probando reproducción del video...');
    const videoTest = document.createElement('video');
    videoTest.src = uploadResult.url;
    videoTest.controls = true;
    videoTest.style.width = '300px';
    videoTest.style.height = '200px';
    
    console.log('✅ Video subido y listo para reproducción');
    console.log('🎉 ¡Flujo completo funcionando!');
    
  } catch (error) {
    console.error('\n❌ Error en el flujo de upload:', error);
    
    if (error.message.includes('Servidor no está corriendo')) {
      console.log('\n💡 Solución:');
      console.log('1. Ejecuta: npm run dev');
      console.log('2. Espera a que el servidor esté listo');
      console.log('3. Ejecuta este script nuevamente');
    } else if (error.message.includes('fetch')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica que el servidor esté corriendo en puerto 5173');
      console.log('2. Revisa que no haya errores en la consola del servidor');
      console.log('3. Verifica que las variables de Cloudinary estén configuradas');
    }
  }
}

// Ejecutar prueba
testUploadFlow();
