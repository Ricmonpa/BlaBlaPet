/**
 * Script de prueba completo para WhatsApp sharing con metadatos dinámicos
 * Este script debe ejecutarse en el navegador
 */

console.log('🧪 PRUEBA COMPLETA DE WHATSAPP SHARING CON METADATOS DINÁMICOS');
console.log('📱 Verificando que WhatsApp muestre preview correcto con datos reales');
console.log('');

// Función principal de prueba
function testCompleteWhatsAppSharing() {
  console.log('🚀 Iniciando prueba completa...');
  console.log('');

  // 1. Crear video de prueba con datos reales
  console.log('1️⃣ Creando video de prueba con datos reales...');
  const testVideo = {
    id: 'test_complete_' + Date.now(),
    petName: 'Max',
    translation: '¡Hola! Quiero jugar contigo 🐕',
    emotionalDubbing: 'El perro está expresando alegría y ganas de jugar',
    mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
    mediaType: 'video',
    createdAt: new Date().toISOString(),
    shareCount: 0
  };
  
  // Guardar en localStorage
  const storedVideos = JSON.parse(localStorage.getItem('yo_pett_videos') || '{}');
  storedVideos[testVideo.id] = testVideo;
  localStorage.setItem('yo_pett_videos', JSON.stringify(storedVideos));
  
  console.log('✅ Video creado:');
  console.log('   - ID:', testVideo.id);
  console.log('   - Pet Name:', testVideo.petName);
  console.log('   - Translation:', testVideo.translation);
  console.log('   - Media URL:', testVideo.mediaUrl);
  console.log('');

  // 2. Generar URL de preview
  console.log('2️⃣ Generando URL de preview...');
  const baseUrl = window.location.origin;
  const previewUrl = `${baseUrl}/api/video-preview/${testVideo.id}`;
  console.log('✅ URL de preview:', previewUrl);
  console.log('');

  // 3. Generar texto de compartir para WhatsApp
  console.log('3️⃣ Generando texto de compartir para WhatsApp...');
  const shareText = `¡Mira lo que dice ${testVideo.petName}! 🐕\n\n"${testVideo.translation}"\n\n#YoPett #Perros #Mascotas\n\nVer video completo:\n${previewUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  
  console.log('✅ Texto de compartir:');
  console.log(shareText);
  console.log('');
  console.log('✅ URL de WhatsApp:', whatsappUrl);
  console.log('');

  // 4. Abrir preview para verificar metadatos
  console.log('4️⃣ Abriendo preview para verificar metadatos...');
  const previewWindow = window.open(previewUrl, '_blank');
  
  // Esperar un poco y verificar metadatos
  setTimeout(() => {
    try {
      const ogTitle = previewWindow.document.querySelector('meta[property="og:title"]');
      const ogDescription = previewWindow.document.querySelector('meta[property="og:description"]');
      const ogImage = previewWindow.document.querySelector('meta[property="og:image"]');
      
      console.log('🔍 Metadatos encontrados:');
      console.log('   - og:title:', ogTitle ? ogTitle.getAttribute('content') : 'No encontrado');
      console.log('   - og:description:', ogDescription ? ogDescription.getAttribute('content') : 'No encontrado');
      console.log('   - og:image:', ogImage ? ogImage.getAttribute('content') : 'No encontrado');
      
      // Verificar si los metadatos son correctos
      const expectedTitle = `¡Mira lo que dice ${testVideo.petName}! 🐕`;
      const expectedDescription = `"${testVideo.translation}"`;
      
      const titleCorrect = ogTitle && ogTitle.getAttribute('content') === expectedTitle;
      const descriptionCorrect = ogDescription && ogDescription.getAttribute('content') === expectedDescription;
      
      if (titleCorrect && descriptionCorrect) {
        console.log('✅ Metadatos dinámicos funcionando correctamente!');
      } else {
        console.log('❌ Metadatos no se actualizaron correctamente');
        console.log('   - Título esperado:', expectedTitle);
        console.log('   - Descripción esperada:', expectedDescription);
      }
    } catch (error) {
      console.log('⚠️ No se pueden leer metadatos por CORS. Abre las herramientas de desarrollador en la nueva pestaña.');
    }
  }, 2000);

  // 5. Abrir WhatsApp para probar
  console.log('5️⃣ Abriendo WhatsApp para probar...');
  console.log('   - Se abrirá WhatsApp Web');
  console.log('   - El mensaje incluirá la URL del preview');
  console.log('   - WhatsApp debería mostrar el preview con los datos reales');
  console.log('');
  
  // Abrir WhatsApp después de un breve delay
  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
  }, 3000);

  // 6. Instrucciones para verificar
  console.log('6️⃣ Instrucciones para verificar:');
  console.log('   📱 En WhatsApp Web:');
  console.log('      - Verifica que el mensaje se envió correctamente');
  console.log('      - Verifica que aparece un preview del video');
  console.log('      - Verifica que el preview muestra los datos correctos');
  console.log('   🔍 En la pestaña del preview:');
  console.log('      - Abre las herramientas de desarrollador (F12)');
  console.log('      - Ve a la pestaña "Elements"');
  console.log('      - Busca los meta tags og:title, og:description, og:image');
  console.log('      - Deberían mostrar los datos reales del video');
  console.log('');

  // 7. Resumen
  console.log('📊 RESUMEN DE LA PRUEBA:');
  console.log('   ✅ Video creado con datos reales');
  console.log('   ✅ URL de preview generada');
  console.log('   ✅ Texto de compartir generado');
  console.log('   ✅ WhatsApp abierto con el mensaje');
  console.log('   ✅ Preview abierto para verificar metadatos');
  console.log('');
  console.log('🎉 Prueba completada! Verifica que WhatsApp muestre el preview correcto.');
  
  return {
    videoId: testVideo.id,
    previewUrl: previewUrl,
    whatsappUrl: whatsappUrl,
    shareText: shareText
  };
}

// Función para verificar metadatos manualmente
function verifyMetadataManually() {
  console.log('🔍 Verificación manual de metadatos:');
  console.log('1. Abre la pestaña del preview');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña "Elements" o "Elementos"');
  console.log('4. Busca estos meta tags:');
  console.log('   - <meta property="og:title" content="...">');
  console.log('   - <meta property="og:description" content="...">');
  console.log('   - <meta property="og:image" content="...">');
  console.log('5. Verifica que muestran los datos reales del video');
}

// Hacer las funciones disponibles globalmente
window.testCompleteWhatsAppSharing = testCompleteWhatsAppSharing;
window.verifyMetadataManually = verifyMetadataManually;

console.log('🚀 Para ejecutar la prueba completa, ejecuta:');
console.log('   testCompleteWhatsAppSharing()');
console.log('');
console.log('🔍 Para verificar metadatos manualmente, ejecuta:');
console.log('   verifyMetadataManually()');
console.log('');
console.log('📋 O copia y pega este código en la consola del navegador:');
console.log('');
console.log(`
// Test completo de WhatsApp sharing
const testVideo = {
  id: 'test_complete_' + Date.now(),
  petName: 'Max',
  translation: '¡Hola! Quiero jugar contigo 🐕',
  mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
  mediaType: 'video'
};

const storedVideos = JSON.parse(localStorage.getItem('yo_pett_videos') || '{}');
storedVideos[testVideo.id] = testVideo;
localStorage.setItem('yo_pett_videos', JSON.stringify(storedVideos));

const previewUrl = window.location.origin + '/api/video-preview/' + testVideo.id;
const shareText = \`¡Mira lo que dice \${testVideo.petName}! 🐕\\n\\n"\${testVideo.translation}"\\n\\n#YoPett #Perros #Mascotas\\n\\nVer video completo:\\n\${previewUrl}\`;
const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(shareText);

console.log('Preview URL:', previewUrl);
console.log('WhatsApp URL:', whatsappUrl);

window.open(previewUrl, '_blank');
setTimeout(() => window.open(whatsappUrl, '_blank'), 2000);
`);
