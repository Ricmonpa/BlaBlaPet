#!/usr/bin/env node

/**
 * Script de prueba para verificar la integración con Gemini IA
 * Uso: node scripts/test-gemini.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/* global process */

// Configuración
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: No se encontró la API key de Gemini');
  console.log('💡 Solución:');
  console.log('   1. Obtén tu API key de: https://makersuite.google.com/app/apikey');
  console.log('   2. Configúrala como variable de entorno:');
  console.log('      export VITE_GEMINI_API_KEY=tu_api_key_aqui');
  console.log('   3. O crea un archivo .env con: VITE_GEMINI_API_KEY=tu_api_key_aqui');
  process.exit(1);
}

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Función para probar conexión básica
async function testBasicConnection() {
  console.log('🔍 Probando conexión básica con Gemini...');
  
  try {
    const result = await model.generateContent("Hola, ¿puedes responder con 'Conexión exitosa'?");
    const response = await result.response;
    const text = response.text();
    
    if (text.includes('Conexión exitosa') || text.length > 0) {
      console.log('✅ Conexión exitosa con Gemini IA');
      return true;
    } else {
      console.log('⚠️  Conexión establecida pero respuesta inesperada:', text);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en conexión básica:', error.message);
    return false;
  }
}

// Función para probar análisis de texto
async function testTextAnalysis() {
  console.log('\n🧠 Probando análisis de texto...');
  
  const prompt = `Eres un experto en comportamiento animal. Analiza esta descripción de un perro y proporciona una traducción divertida:

"Un perro golden retriever está sentado en el parque, moviendo la cola rápidamente y mirando fijamente a su dueño que se acerca"

Responde en formato JSON:
{
  "translation": "traducción divertida",
  "confidence": 85,
  "emotion": "feliz",
  "behavior": "moviendo la cola rápidamente",
  "context": "probablemente ve a su dueño"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📝 Respuesta de Gemini:');
    console.log(text);
    
    // Intentar parsear JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parseado correctamente:');
        console.log(JSON.stringify(parsed, null, 2));
        return true;
      } else {
        console.log('⚠️  No se encontró JSON en la respuesta');
        return false;
      }
    } catch (parseError) {
      console.log('⚠️  Error parseando JSON:', parseError.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en análisis de texto:', error.message);
    return false;
  }
}

// Función para probar con imagen de ejemplo
async function testImageAnalysis() {
  console.log('\n🖼️  Probando análisis de imagen...');
  
  // Crear una imagen de prueba simple (base64 de un pixel rojo)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  const prompt = `Eres un experto en comportamiento animal. Analiza esta imagen y proporciona una traducción divertida de lo que podría estar "diciendo" el animal en la imagen.

Responde en formato JSON:
{
  "translation": "traducción divertida",
  "confidence": 85,
  "emotion": "neutral",
  "behavior": "no especificado",
  "context": "imagen de prueba"
}`;

  try {
    const imagePart = {
      inlineData: {
        data: testImageBase64,
        mimeType: 'image/png'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log('📝 Respuesta de Gemini (imagen):');
    console.log(text);
    
    return true;
  } catch (error) {
    console.error('❌ Error en análisis de imagen:', error.message);
    return false;
  }
}

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de integración con Gemini IA\n');
  
  const tests = [
    { name: 'Conexión Básica', fn: testBasicConnection },
    { name: 'Análisis de Texto', fn: testTextAnalysis },
    { name: 'Análisis de Imagen', fn: testImageAnalysis }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 Ejecutando: ${test.name}`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    const success = await test.fn();
    const duration = Date.now() - startTime;
    
    results.push({
      name: test.name,
      success,
      duration
    });
    
    console.log(`⏱️  Duración: ${duration}ms`);
  }
  
  // Resumen de resultados
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.duration}ms`);
  });
  
  console.log(`\n🎯 Resultado: ${passed}/${total} pruebas exitosas`);
  
  if (passed === total) {
    console.log('🎉 ¡Todas las pruebas pasaron! La integración con Gemini está lista.');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Ejecuta: npm run dev');
    console.log('   2. Ve a: http://localhost:5173/gemini-test');
    console.log('   3. Prueba con imágenes y videos reales de perros');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa la configuración.');
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
