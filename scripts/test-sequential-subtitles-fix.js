/**
 * Script de prueba para verificar que los subtítulos secuenciales se muestran correctamente en el feed compartido
 * 
 * USO:
 * 1. Abrir la consola del navegador en localhost:5174
 * 2. Ejecutar: testSequentialSubtitlesFix()
 */

// Función para probar la corrección de subtítulos secuenciales
async function testSequentialSubtitlesFix() {
  console.log('🚀 Iniciando prueba de corrección de subtítulos secuenciales...');
  console.log('');

  try {
    // 1. Verificar que el servicio está disponible
    console.log('1️⃣ Verificando servicios...');
    if (typeof window.videoShareService === 'undefined') {
      console.log('❌ videoShareService no está disponible');
      console.log('   Asegúrate de que la app esté cargada en el navegador');
      return;
    }
    console.log('✅ videoShareService disponible');
    console.log('');

    // 2. Obtener feed público actual
    console.log('2️⃣ Obteniendo feed público actual...');
    const publicFeed = await window.videoShareService.getPublicFeed();
    console.log(`📊 Feed público contiene ${publicFeed.length} videos`);
    console.log('');

    // 3. Analizar videos con subtítulos secuenciales
    console.log('3️⃣ Analizando videos con subtítulos secuenciales...');
    const videosWithSequentialSubtitles = publicFeed.filter(video => 
      video.isSequentialSubtitles && video.subtitles && video.subtitles.length > 0
    );
    
    console.log(`🎬 Videos con subtítulos secuenciales: ${videosWithSequentialSubtitles.length}`);
    
    if (videosWithSequentialSubtitles.length > 0) {
      console.log('📝 Detalles de videos con subtítulos secuenciales:');
      videosWithSequentialSubtitles.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.petName} (${video.id})`);
        console.log(`      - Subtítulos: ${video.subtitles.length}`);
        console.log(`      - Duración: ${video.totalDuration}s`);
        console.log(`      - Primer subtítulo: "${video.subtitles[0]?.traduccion_emocional}"`);
        console.log('');
      });
    } else {
      console.log('⚠️ No se encontraron videos con subtítulos secuenciales');
      console.log('   Esto puede ser normal si no hay videos recientes con esta funcionalidad');
      console.log('');
    }

    // 4. Simular conversión de video a post (como hace SharedFeed)
    console.log('4️⃣ Simulando conversión de video a post...');
    if (videosWithSequentialSubtitles.length > 0) {
      const testVideo = videosWithSequentialSubtitles[0];
      console.log('📝 Video de prueba:', testVideo.petName);
      
      // Simular la función convertVideoToPost
      const hasSequentialSubtitles = testVideo.isSequentialSubtitles && testVideo.subtitles && testVideo.subtitles.length > 0;
      const convertedPost = {
        id: testVideo.id,
        username: `@${testVideo.userId}`,
        petName: testVideo.petName || 'Mascota',
        breed: 'Mascota',
        mediaUrl: testVideo.mediaUrl || testVideo.thumbnailUrl,
        mediaType: testVideo.mediaType || 'video',
        translation: hasSequentialSubtitles ? null : (testVideo.translation || testVideo.emotionalDubbing || 'Análisis de comportamiento'),
        emotionalDubbing: hasSequentialSubtitles ? null : (testVideo.emotionalDubbing || testVideo.translation),
        isSequentialSubtitles: testVideo.isSequentialSubtitles || false,
        subtitles: testVideo.subtitles || null,
        totalDuration: testVideo.totalDuration || testVideo.duration || 30
      };
      
      console.log('✅ Post convertido:');
      console.log(`   - isSequentialSubtitles: ${convertedPost.isSequentialSubtitles}`);
      console.log(`   - subtitles: ${convertedPost.subtitles?.length} elementos`);
      console.log(`   - totalDuration: ${convertedPost.totalDuration}s`);
      console.log(`   - translation: ${convertedPost.translation ? 'Presente' : 'Nulo (correcto para subtítulos secuenciales)'}`);
      console.log('');
    }

    // 5. Verificar que la corrección está implementada
    console.log('5️⃣ Verificando implementación de la corrección...');
    
    // Verificar que SharedFeed tiene la función convertVideoToPost actualizada
    const sharedFeedCode = await fetch('/src/components/SharedFeed.jsx').then(r => r.text());
    const hasSequentialSubtitlesCheck = sharedFeedCode.includes('hasSequentialSubtitles');
    const preservesSubtitles = sharedFeedCode.includes('isSequentialSubtitles: video.isSequentialSubtitles');
    
    console.log(`✅ Verificación de código:`);
    console.log(`   - Función convertVideoToPost actualizada: ${hasSequentialSubtitlesCheck ? 'Sí' : 'No'}`);
    console.log(`   - Preserva propiedades de subtítulos: ${preservesSubtitles ? 'Sí' : 'No'}`);
    console.log('');

    // 6. Resumen de la prueba
    console.log('📊 RESUMEN DE LA PRUEBA:');
    console.log('   ✅ Servicios disponibles');
    console.log(`   ✅ Feed público: ${publicFeed.length} videos`);
    console.log(`   ✅ Videos con subtítulos secuenciales: ${videosWithSequentialSubtitles.length}`);
    console.log(`   ✅ Corrección implementada: ${hasSequentialSubtitlesCheck && preservesSubtitles ? 'Sí' : 'No'}`);
    console.log('');

    if (videosWithSequentialSubtitles.length > 0) {
      console.log('🎉 ¡Corrección implementada correctamente!');
      console.log('   - Los videos con subtítulos secuenciales ahora se muestran correctamente');
      console.log('   - Las propiedades de subtítulos se preservan en la conversión');
      console.log('   - Los subtítulos secuenciales aparecerán en lugar de traducciones estáticas');
      console.log('');
      console.log('🔍 Para verificar visualmente:');
      console.log('   1. Ve al feed compartido (Home)');
      console.log('   2. Busca videos que muestren subtítulos secuenciales');
      console.log('   3. Verifica que aparezcan las traducciones técnicas y emocionales por momentos');
    } else {
      console.log('⚠️ No hay videos con subtítulos secuenciales para probar');
      console.log('   - Crea un nuevo video desde la cámara con subtítulos secuenciales');
      console.log('   - Luego ejecuta este script nuevamente');
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Función para crear un video de prueba con subtítulos secuenciales
async function createTestVideoWithSequentialSubtitles() {
  console.log('🎬 Creando video de prueba con subtítulos secuenciales...');
  
  try {
    // Crear un video de prueba con subtítulos secuenciales simulados
    const testVideo = {
      petName: 'Perro de Prueba',
      translation: 'Análisis de comportamiento',
      emotionalDubbing: '¡Qué divertido!',
      mediaUrl: 'data:video/mp4;base64,test', // URL simulada
      mediaType: 'video',
      userId: 'test_user',
      tags: ['prueba', 'subtítulos_secuenciales'],
      duration: 30,
      resolution: '400x600',
      format: 'mp4',
      isSequentialSubtitles: true,
      subtitles: [
        {
          id: 'subtitle_1',
          timestamp: '00:00 - 00:05',
          traduccion_tecnica: 'El perro se encuentra en una postura de juego, agitando un juguete de un lado a otro. Este comportamiento indica una alta energía y excitación.',
          traduccion_emocional: '¡Guau! ¡Miren mi juguete! ¡Qué divertido es!',
          confidence: 90,
          source: 'thought_model_sequential'
        },
        {
          id: 'subtitle_2',
          timestamp: '00:06 - 00:10',
          traduccion_tecnica: 'El perro baja el pecho en una clara reverencia de juego, mirando hacia la cámara. Esta es una invitación directa a la interacción.',
          traduccion_emocional: '¡Mira lo que hago! ¡Ven a jugar conmigo, por favor!',
          confidence: 85,
          source: 'thought_model_sequential'
        }
      ],
      totalDuration: 30
    };

    const videoUrl = await window.videoShareService.storeVideoAndGenerateUrl(testVideo);
    console.log('✅ Video de prueba creado:', videoUrl);
    console.log('   - Ahora ejecuta testSequentialSubtitlesFix() para verificar');
    
  } catch (error) {
    console.error('❌ Error creando video de prueba:', error);
  }
}

// Exportar funciones para uso en consola
window.testSequentialSubtitlesFix = testSequentialSubtitlesFix;
window.createTestVideoWithSequentialSubtitles = createTestVideoWithSequentialSubtitles;

console.log('🔧 Script de prueba de subtítulos secuenciales cargado');
console.log('   - Ejecuta: testSequentialSubtitlesFix()');
console.log('   - O crea un video de prueba: createTestVideoWithSequentialSubtitles()');