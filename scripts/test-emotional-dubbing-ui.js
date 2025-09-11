#!/usr/bin/env node

/**
 * Script para probar la interfaz de doblaje emocional
 * Simula la creación de posts con diferentes emociones
 */

import emotionalDubbingService from '../src/services/emotionalDubbingService.js';

console.log('🎭 Prueba de la Interfaz de Doblaje Emocional\n');

// Simular diferentes tipos de posts
const testPosts = [
  {
    name: 'Post Feliz',
    translation: '¡Estoy feliz de verte! ¿Quieres jugar conmigo?',
    emotion: 'feliz',
    context: 'juego',
    behavior: 'Cola moviéndose, orejas relajadas, boca abierta'
  },
  {
    name: 'Post Ansioso',
    translation: 'Aléjate ¡Juega conmigo ya! Exploración',
    emotion: 'ansioso',
    context: 'alerta_defensiva',
    behavior: 'Postura baja, cola relajada, orejas hacia atrás'
  },
  {
    name: 'Post Exigente',
    translation: '¡Dame! ¡Dame! Ya di la pata',
    emotion: 'exigente',
    context: 'recompensa',
    behavior: 'Pata levantada, mirada intensa, boca ligeramente abierta'
  },
  {
    name: 'Post Curioso',
    translation: '¿Qué es eso? Quiero explorarlo',
    emotion: 'curioso',
    context: 'exploración',
    behavior: 'Orejas hacia adelante, cola quieta, mirada fija'
  }
];

console.log('📱 Simulación de Posts para la Interfaz:\n');

testPosts.forEach((post, index) => {
  console.log(`${'='.repeat(60)}`);
  console.log(`📝 ${post.name} #${index + 1}`);
  console.log(`${'='.repeat(60)}`);
  
  // Generar doblaje emocional
  const emotionalResult = emotionalDubbingService.generateEmotionalDubbing(
    post.translation,
    post.emotion,
    post.context,
    post.behavior
  );
  
  console.log('\n🎭 DOBLAJE EMOCIONAL (Capa Principal):');
  console.log(`   Texto: "${emotionalResult.emotionalDubbing}"`);
  console.log(`   Tono: ${emotionalResult.tone}`);
  console.log(`   Estilo: ${emotionalResult.style}`);
  console.log(`   Contexto: ${emotionalResult.contextStyle}`);
  console.log(`   Confianza: ${emotionalResult.confidence}%`);
  
  console.log('\n🔍 TRADUCCIÓN TÉCNICA (Capa Secundaria):');
  console.log(`   Texto: "${post.translation}"`);
  console.log(`   Emoción: ${post.emotion}`);
  console.log(`   Contexto: ${post.context}`);
  console.log(`   Comportamiento: ${post.behavior}`);
  
  console.log('\n📊 ESTRUCTURA DEL POST:');
  console.log(`   {
     id: ${Date.now() + index},
     username: '@test_user',
     petName: 'Test Pet',
     breed: 'Test Breed',
     mediaUrl: 'https://example.com/test.jpg',
     mediaType: 'photo',
     translation: "${post.translation}",
     emotionalDubbing: "${emotionalResult.emotionalDubbing}",
     emotionalTone: "${emotionalResult.tone}",
     emotionalStyle: "${emotionalResult.style}",
     emotion: "${post.emotion}",
     context: "${post.context}",
     confidence: ${emotionalResult.confidence},
     likes: 0,
     comments: 0,
     timestamp: 'Ahora'
   }`);
  
  console.log('\n✅ Post generado correctamente\n');
});

// Simular diferentes estilos personalizados
console.log('\n🎨 PRUEBAS DE ESTILOS PERSONALIZADOS:\n');

const sampleTranslation = '¡Hola! ¿Cómo estás?';
const styles = ['amigable', 'dramático', 'poético', 'deportivo'];

styles.forEach(style => {
  const customDubbing = emotionalDubbingService.generateCustomDubbing(sampleTranslation, style);
  
  console.log(`${'='.repeat(40)}`);
  console.log(`🎨 Estilo: ${style.toUpperCase()}`);
  console.log(`   Entrada: "${sampleTranslation}"`);
  console.log(`   Salida: "${customDubbing}"`);
  console.log('   ✅ Estilo personalizado generado');
});

console.log('\n\n📋 INSTRUCCIONES PARA PROBAR EN LA INTERFAZ:\n');
console.log('1. Abre la aplicación en tu navegador');
console.log('2. Ve a /profile');
console.log('3. Haz clic en "Doblaje Emocional" en las herramientas de desarrollo');
console.log('4. Ejecuta las pruebas interactivas');
console.log('5. Verifica que se muestren ambas capas de subtítulos');
console.log('6. Navega al home para ver los posts con doblaje emocional');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('   - Posts simulados muestran doblaje emocional + traducción técnica');
console.log('   - Nueva traducción desde cámara incluye doblaje emocional');
console.log('   - Interfaz muestra ambas capas claramente separadas');

console.log('\n✨ ¡Pruebas de interfaz completadas!\n');
