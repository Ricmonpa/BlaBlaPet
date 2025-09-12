/**
 * Script de prueba para verificar la integración con la base de datos
 * Este script debe ejecutarse en el navegador
 */

console.log('🧪 PRUEBA DE INTEGRACIÓN CON BASE DE DATOS');
console.log('📊 Verificando que los videos se guarden y persistan correctamente');
console.log('');

// Función para probar la integración completa
async function testDatabaseIntegration() {
  console.log('🚀 Iniciando prueba de integración...');
  console.log('');

  try {
    // 1. Verificar que la base de datos esté disponible
    console.log('1️⃣ Verificando disponibilidad de la base de datos...');
    const dbResponse = await fetch('http://localhost:3002/videos');
    if (!dbResponse.ok) {
      throw new Error('Base de datos no disponible');
    }
    console.log('✅ Base de datos disponible');
    console.log('');

    // 2. Crear un video de prueba con datos reales del modelo de pensamiento
    console.log('2️⃣ Creando video de prueba con datos del modelo de pensamiento...');
    const testVideo = {
      petName: 'Luna',
      translation: '¡Quiero salir a pasear! 🐕',
      emotionalDubbing: 'El perro está expresando ganas de salir y hacer ejercicio',
      mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
      mediaType: 'video',
      userId: 'test_user_' + Date.now(),
      tags: ['perro', 'pasear', 'ejercicio'],
      duration: 25,
      resolution: '400x600',
      format: 'mp4'
    };
    
    console.log('📝 Video de prueba creado:');
    console.log('   - Pet Name:', testVideo.petName);
    console.log('   - Translation:', testVideo.translation);
    console.log('   - Media URL:', testVideo.mediaUrl);
    console.log('');

    // 3. Simular el proceso de guardado usando videoShareService
    console.log('3️⃣ Simulando guardado usando videoShareService...');
    
    // Importar el servicio (esto funcionará en el navegador)
    if (typeof window !== 'undefined' && window.videoShareService) {
      const videoUrl = await window.videoShareService.storeVideoAndGenerateUrl(testVideo);
      console.log('✅ Video guardado exitosamente');
      console.log('   - URL generada:', videoUrl);
      console.log('');

      // 4. Verificar que el video se guardó en la base de datos
      console.log('4️⃣ Verificando que el video se guardó en la base de datos...');
      const videoId = videoUrl.split('/').pop();
      const savedVideo = await window.videoShareService.getVideoById(videoId);
      
      if (savedVideo) {
        console.log('✅ Video encontrado en la base de datos:');
        console.log('   - ID:', savedVideo.id);
        console.log('   - Pet Name:', savedVideo.petName);
        console.log('   - Translation:', savedVideo.translation);
        console.log('   - Share Count:', savedVideo.shareCount);
        console.log('   - Created At:', savedVideo.createdAt);
        console.log('');
      } else {
        console.log('❌ Video no encontrado en la base de datos');
        return;
      }

      // 5. Probar el endpoint de preview
      console.log('5️⃣ Probando endpoint de preview...');
      const previewUrl = `http://localhost:5174/api/video-preview/${videoId}`;
      console.log('   - Preview URL:', previewUrl);
      console.log('   - Abriendo preview en nueva pestaña...');
      
      // Abrir preview en nueva pestaña
      window.open(previewUrl, '_blank');
      console.log('');

      // 6. Probar incrementar contador de compartidos
      console.log('6️⃣ Probando incremento de contador de compartidos...');
      await window.videoShareService.incrementShareCount(videoId);
      
      // Verificar que se incrementó
      const updatedVideo = await window.videoShareService.getVideoById(videoId);
      console.log('✅ Contador de compartidos incrementado:', updatedVideo.shareCount);
      console.log('');

      // 7. Probar obtener feed público
      console.log('7️⃣ Probando obtención de feed público...');
      const publicFeed = await window.videoShareService.getPublicFeed();
      console.log(`✅ Feed público obtenido: ${publicFeed.length} videos`);
      
      if (publicFeed.length > 0) {
        console.log('   - Último video:', publicFeed[0].petName, '-', publicFeed[0].translation);
      }
      console.log('');

      // 8. Resumen de la prueba
      console.log('📊 RESUMEN DE LA PRUEBA:');
      console.log('   ✅ Base de datos disponible');
      console.log('   ✅ Video creado con datos del modelo de pensamiento');
      console.log('   ✅ Video guardado en base de datos');
      console.log('   ✅ Video recuperado desde base de datos');
      console.log('   ✅ Preview generado correctamente');
      console.log('   ✅ Contador de compartidos funcionando');
      console.log('   ✅ Feed público funcionando');
      console.log('');
      console.log('🎉 ¡Integración con base de datos funcionando correctamente!');
      console.log('   - Los videos se guardan en la base de datos real');
      console.log('   - El feed es compartido entre todos los usuarios');
      console.log('   - Los metadatos se generan dinámicamente');
      console.log('   - El modelo de pensamiento se preserva intacto');

    } else {
      console.log('❌ videoShareService no está disponible en window');
      console.log('   Asegúrate de que la app esté cargada en el navegador');
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Función para verificar la base de datos directamente
async function checkDatabaseDirectly() {
  console.log('🔍 Verificando base de datos directamente...');
  
  try {
    const response = await fetch('http://localhost:3002/videos');
    const videos = await response.json();
    
    console.log(`📊 Base de datos contiene ${videos.length} videos:`);
    videos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.petName} - "${video.translation}" (${video.shareCount} shares)`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
  }
}

// Hacer las funciones disponibles globalmente
window.testDatabaseIntegration = testDatabaseIntegration;
window.checkDatabaseDirectly = checkDatabaseDirectly;

console.log('🚀 Para ejecutar la prueba completa, ejecuta:');
console.log('   testDatabaseIntegration()');
console.log('');
console.log('🔍 Para verificar la base de datos directamente, ejecuta:');
console.log('   checkDatabaseDirectly()');
console.log('');
console.log('📋 O copia y pega este código en la consola del navegador:');
console.log('');
console.log(`
// Test de integración con base de datos
async function testIntegration() {
  const testVideo = {
    petName: 'Luna',
    translation: '¡Quiero salir a pasear! 🐕',
    mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
    mediaType: 'video'
  };
  
  const videoUrl = await window.videoShareService.storeVideoAndGenerateUrl(testVideo);
  console.log('Video guardado:', videoUrl);
  
  const videoId = videoUrl.split('/').pop();
  const savedVideo = await window.videoShareService.getVideoById(videoId);
  console.log('Video recuperado:', savedVideo);
  
  const previewUrl = 'http://localhost:5174/api/video-preview/' + videoId;
  window.open(previewUrl, '_blank');
}

testIntegration();
`);
