/**
 * Script para probar el endpoint de preview de video
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5173';

async function testVideoPreviewEndpoint() {
  console.log('🧪 Probando endpoint de preview de video...\n');

  try {
    // 1. Crear un video de prueba
    console.log('1️⃣ Creando video de prueba...');
    
    // Simular datos de video
    const mockVideo = {
      id: 'test_video_123',
      petName: 'Max',
      breed: 'Golden Retriever',
      mediaUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      mediaType: 'video',
      translation: '¡Hola humano! Quiero que me des comida ahora mismo.',
      emotionalDubbing: '¡Hola humano! Quiero que me des comida ahora mismo.',
      confidence: 92
    };

    // Simular almacenamiento del video
    const { default: videoShareService } = await import('../src/services/videoShareService.js');
    
    // Agregar el video al almacenamiento
    videoShareService.videoStorage.set('test_video_123', {
      ...mockVideo,
      id: 'test_video_123',
      createdAt: new Date().toISOString(),
      shareCount: 0
    });
    
    console.log('📹 Video almacenado con ID: test_video_123');
    console.log('🔍 Videos en almacenamiento:', videoShareService.videoStorage.size);
    
    console.log('✅ Video de prueba creado');
    console.log('');

    // 2. Probar endpoint de preview
    console.log('2️⃣ Probando endpoint de preview...');
    const response = await fetch(`${BASE_URL}/video/test_video_123`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('✅ Endpoint respondió correctamente');
    console.log('');

    // 3. Verificar metadatos Open Graph
    console.log('3️⃣ Verificando metadatos Open Graph...');
    
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
    const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1];
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
    
    console.log('✅ Metadatos encontrados:');
    console.log('   - og:title:', ogTitle);
    console.log('   - og:description:', ogDescription);
    console.log('   - og:image:', ogImage);
    console.log('   - og:url:', ogUrl);
    console.log('');

    // 4. Verificar que WhatsApp pueda leer los metadatos
    console.log('4️⃣ Verificando compatibilidad con WhatsApp...');
    
    const hasRequiredMeta = ogTitle && ogDescription && ogImage && ogUrl;
    if (hasRequiredMeta) {
      console.log('✅ Todos los metadatos requeridos están presentes');
      console.log('✅ WhatsApp debería poder generar el preview correctamente');
    } else {
      console.log('❌ Faltan metadatos requeridos');
    }
    console.log('');

    // 5. Mostrar URL de prueba
    console.log('5️⃣ URL de prueba:');
    console.log(`   ${BASE_URL}/video/test_video_123`);
    console.log('');
    console.log('📱 Para probar en WhatsApp:');
    console.log('1. Copia la URL de arriba');
    console.log('2. Pégalo en un chat de WhatsApp');
    console.log('3. Verifica que aparezca el preview con imagen y descripción');
    console.log('');

    console.log('🎉 ¡Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('1. Verificar que el servidor esté corriendo (npm run dev)');
    console.log('2. Verificar que no haya errores en la consola del servidor');
    console.log('3. Verificar que el plugin de Vite esté funcionando correctamente');
  }
}

testVideoPreviewEndpoint();
