/**
 * Script final para probar el preview de WhatsApp
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://192.168.1.188:5173'; // IP de tu servidor

async function testWhatsAppPreview() {
  console.log('🧪 Probando preview de WhatsApp...\n');

  try {
    // 1. Probar el endpoint de preview
    console.log('1️⃣ Probando endpoint de preview...');
    const response = await fetch(`${BASE_URL}/video.html`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('✅ Endpoint respondió correctamente');
    console.log('');

    // 2. Verificar metadatos Open Graph
    console.log('2️⃣ Verificando metadatos Open Graph...');
    
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

    // 3. Verificar que todos los metadatos requeridos estén presentes
    console.log('3️⃣ Verificando metadatos requeridos...');
    
    const hasTitle = ogTitle && ogTitle.length > 0;
    const hasDescription = ogDescription && ogDescription.length > 0;
    const hasImage = ogImage && ogImage.length > 0;
    const hasUrl = ogUrl && ogUrl.length > 0;
    
    console.log('   - Título:', hasTitle ? '✅' : '❌');
    console.log('   - Descripción:', hasDescription ? '✅' : '❌');
    console.log('   - Imagen:', hasImage ? '✅' : '❌');
    console.log('   - URL:', hasUrl ? '✅' : '❌');
    console.log('');

    if (hasTitle && hasDescription && hasImage && hasUrl) {
      console.log('🎉 ¡Todos los metadatos están presentes!');
      console.log('✅ WhatsApp debería poder generar el preview correctamente');
    } else {
      console.log('❌ Faltan metadatos requeridos');
    }
    console.log('');

    // 4. Mostrar URL de prueba
    console.log('4️⃣ URL de prueba:');
    console.log(`   ${BASE_URL}/video.html`);
    console.log('');

    // 5. Instrucciones para probar en WhatsApp
    console.log('📱 Para probar en WhatsApp:');
    console.log('1. Copia esta URL:', `${BASE_URL}/video.html`);
    console.log('2. Pégalo en un chat de WhatsApp');
    console.log('3. Verifica que aparezca el preview con:');
    console.log('   - 🖼️  Imagen del perro');
    console.log('   - 📝 Título: "¡Mira lo que dice mi mascota! 🐕"');
    console.log('   - 📄 Descripción: "Análisis de comportamiento de mascota..."');
    console.log('   - 🔗 Enlace que lleva a Yo Pett');
    console.log('');

    // 6. Verificar que la imagen sea accesible
    console.log('5️⃣ Verificando accesibilidad de la imagen...');
    try {
      const imageResponse = await fetch(ogImage);
      if (imageResponse.ok) {
        console.log('✅ Imagen accesible y válida');
      } else {
        console.log('❌ Imagen no accesible:', imageResponse.status);
      }
    } catch (error) {
      console.log('❌ Error verificando imagen:', error.message);
    }
    console.log('');

    console.log('🚀 ¡Sistema listo para compartir en WhatsApp!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('1. Verificar que el servidor esté corriendo (npm run dev)');
    console.log('2. Verificar que la IP sea correcta:', BASE_URL);
    console.log('3. Verificar que no haya errores en la consola del servidor');
  }
}

testWhatsAppPreview();
