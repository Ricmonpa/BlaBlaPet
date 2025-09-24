#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Verificando configuración de API...\n');

// Verificar que la API key esté configurada
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ VITE_GEMINI_API_KEY no encontrada en .env');
  process.exit(1);
}

console.log('✅ API Key configurada:', apiKey.substring(0, 10) + '...');

// Inicializar Gemini con el nuevo modelo
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

console.log('✅ Modelo configurado: gemini-2.0-flash');

// Probar la API
try {
  console.log('\n🧪 Probando API...');
  const result = await model.generateContent("Hola, ¿funcionas correctamente?");
  const response = await result.response;
  const text = response.text();
  
  console.log('✅ API funcionando correctamente');
  console.log('📝 Respuesta:', text.substring(0, 100) + '...');
  
  console.log('\n🎉 ¡Configuración completada exitosamente!');
  console.log('📊 Cuota disponible: 200 requests/día');
  console.log('⚡ Modelo: gemini-2.0-flash (más rápido)');
  
} catch (error) {
  console.error('❌ Error probando API:', error.message);
  
  if (error.message.includes('quota')) {
    console.log('💡 La nueva API key debería tener cuota fresca');
  }
  
  process.exit(1);
}
