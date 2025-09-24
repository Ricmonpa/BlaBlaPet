#!/usr/bin/env node

/**
 * Script para limpiar videos viejos con URLs blob expiradas
 * Este script elimina videos del localStorage que tienen URLs blob que ya no funcionan
 */

console.log('🧹 Iniciando limpieza de videos viejos con URLs blob expiradas...');

// Simular el entorno del navegador para acceder a localStorage
if (typeof window === 'undefined') {
  // En Node.js, no podemos acceder a localStorage directamente
  console.log('⚠️ Este script debe ejecutarse en el navegador');
  console.log('📋 Instrucciones:');
  console.log('1. Abre la consola del navegador (F12)');
  console.log('2. Copia y pega este código:');
  console.log(`
// Limpiar videos viejos con URLs blob
const localVideos = JSON.parse(localStorage.getItem('localVideos') || '[]');
const validVideos = [];
let removedCount = 0;

localVideos.forEach(video => {
  const isBlobUrl = video.mediaUrl && video.mediaUrl.startsWith('blob:');
  const isVercelBlobUrl = video.mediaUrl && video.mediaUrl.includes('blob.vercel-storage.com');
  
  if (isBlobUrl || isVercelBlobUrl) {
    console.log('🚫 Removiendo video con URL blob expirada:', video.id);
    removedCount++;
  } else {
    validVideos.push(video);
  }
});

if (removedCount > 0) {
  localStorage.setItem('localVideos', JSON.stringify(validVideos));
  console.log(\`✅ Limpiados \${removedCount} videos con URLs expiradas\`);
  console.log(\`📊 Videos restantes: \${validVideos.length}\`);
} else {
  console.log('✅ No hay videos con URLs blob para limpiar');
}
  `);
  process.exit(0);
}

// Si estamos en el navegador, ejecutar la limpieza
const localVideos = JSON.parse(localStorage.getItem('localVideos') || '[]');
const validVideos = [];
let removedCount = 0;

localVideos.forEach(video => {
  const isBlobUrl = video.mediaUrl && video.mediaUrl.startsWith('blob:');
  const isVercelBlobUrl = video.mediaUrl && video.mediaUrl.includes('blob.vercel-storage.com');
  
  if (isBlobUrl || isVercelBlobUrl) {
    console.log('🚫 Removiendo video con URL blob expirada:', video.id);
    removedCount++;
  } else {
    validVideos.push(video);
  }
});

if (removedCount > 0) {
  localStorage.setItem('localVideos', JSON.stringify(validVideos));
  console.log(`✅ Limpiados ${removedCount} videos con URLs expiradas`);
  console.log(`📊 Videos restantes: ${validVideos.length}`);
} else {
  console.log('✅ No hay videos con URLs blob para limpiar');
}
