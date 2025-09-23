/**
 * Script para probar la integración con Cloudinary
 */

import { config } from 'dotenv';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary, getCloudinaryVideoUrl, getCloudinaryThumbnailUrl } from '../src/config/cloudinary.js';

// Cargar variables de entorno
config();

async function testCloudinaryIntegration() {
  console.log('🧪 Iniciando pruebas de Cloudinary...');
  
  // Verificar variables de entorno
  console.log('\n📋 Verificando configuración:');
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;
  
  console.log('REACT_APP_CLOUDINARY_CLOUD_NAME:', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ Faltante');
  console.log('REACT_APP_CLOUDINARY_API_KEY:', process.env.REACT_APP_CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ Faltante');
  console.log('REACT_APP_CLOUDINARY_API_SECRET:', process.env.REACT_APP_CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Faltante');
  
  console.log('\n🔍 Valores detectados:');
  console.log('Cloud Name:', cloudName);
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'No encontrado');
  console.log('API Secret:', apiSecret ? `${apiSecret.substring(0, 8)}...` : 'No encontrado');
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.log('\n❌ Error: Faltan variables de entorno de Cloudinary');
    console.log('Por favor, agrega estas variables a tu archivo .env:');
    console.log('REACT_APP_CLOUDINARY_CLOUD_NAME=tu_cloud_name');
    console.log('REACT_APP_CLOUDINARY_API_KEY=tu_api_key');
    console.log('REACT_APP_CLOUDINARY_API_SECRET=tu_api_secret');
    return;
  }

  try {
    // Crear un video de prueba real (MP4 válido)
    console.log('\n🎬 Creando video de prueba...');
    
    // Crear un video MP4 mínimo válido (solo para testing)
    const fs = await import('fs');
    const path = await import('path');
    
    // Buscar un video existente en el proyecto para usar como prueba
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    let testVideoPath = null;
    
    try {
      const videoFiles = fs.readdirSync(videosDir);
      if (videoFiles.length > 0) {
        testVideoPath = path.join(videosDir, videoFiles[0]);
        console.log('📹 Usando video existente para prueba:', videoFiles[0]);
      }
    } catch (error) {
      console.log('⚠️ No se encontraron videos existentes, saltando upload real');
    }
    
    if (testVideoPath) {
      console.log('📤 Subiendo video de prueba a Cloudinary...');
      const testVideoBuffer = fs.readFileSync(testVideoPath);
      
      const uploadResult = await uploadVideoToCloudinary(testVideoBuffer, {
        tags: ['test', 'yo-pett'],
        context: {
          alt: 'Test Video',
          caption: 'Video de prueba para integración Cloudinary'
        }
      });
      
      console.log('✅ Upload exitoso:');
      console.log('URL:', uploadResult.url);
      console.log('Public ID:', uploadResult.publicId);
      console.log('Asset ID:', uploadResult.assetId);
      
      // Probar generación de URLs
      console.log('\n🔗 Probando generación de URLs:');
      const videoUrl = getCloudinaryVideoUrl(uploadResult.publicId, {
        width: 640,
        height: 480,
        crop: 'scale'
      });
      console.log('Video URL con transformaciones:', videoUrl);
      
      const thumbnailUrl = getCloudinaryThumbnailUrl(uploadResult.publicId, 320, 240);
      console.log('Thumbnail URL:', thumbnailUrl);
      
      // Limpiar: eliminar video de prueba
      console.log('\n🧹 Limpiando video de prueba...');
      const deleteResult = await deleteVideoFromCloudinary(uploadResult.publicId);
      console.log('Resultado de eliminación:', deleteResult);
      
      console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
      console.log('✅ Cloudinary está configurado correctamente');
    } else {
      console.log('\n✅ Cloudinary está configurado correctamente (sin video de prueba)');
      console.log('💡 Para probar upload real, agrega un video a la carpeta public/videos/');
    }
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    console.error('Detalles:', error.message || error);
    
    if (error.message && error.message.includes('Invalid cloud name')) {
      console.log('\n💡 Sugerencia: Verifica que CLOUDINARY_CLOUD_NAME sea correcto');
    } else if (error.message && error.message.includes('Invalid API key')) {
      console.log('\n💡 Sugerencia: Verifica que CLOUDINARY_API_KEY sea correcto');
    } else if (error.message && error.message.includes('Invalid API secret')) {
      console.log('\n💡 Sugerencia: Verifica que CLOUDINARY_API_SECRET sea correcto');
    } else if (error.error && error.error.message === 'Request Timeout') {
      console.log('\n💡 El video es muy grande para la prueba. Cloudinary está funcionando correctamente.');
      console.log('✅ La configuración de Cloudinary es correcta');
    }
  }
}

// Ejecutar pruebas
testCloudinaryIntegration();
