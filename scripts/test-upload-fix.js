/**
 * Script para probar la corrección del upload directo de videos
 * Simula el proceso completo de upload de videos de diferentes tamaños
 */

// Función para simular un archivo de video
function createMockVideoFile(sizeMB, filename = 'test-video.mp4') {
  const sizeBytes = sizeMB * 1024 * 1024;
  const mockData = new Uint8Array(sizeBytes);
  
  return {
    name: filename,
    size: sizeBytes,
    type: 'video/mp4',
    lastModified: Date.now(),
    // Simular un archivo blob
    arrayBuffer: () => Promise.resolve(mockData.buffer),
    stream: () => new ReadableStream({
      start(controller) {
        controller.enqueue(mockData);
        controller.close();
      }
    })
  };
}

// Función para probar el endpoint get-upload-url
async function testGetUploadUrl(fileSize, filename, contentType) {
  console.log(`\n🔍 Testing get-upload-url endpoint...`);
  console.log(`   File: ${filename}, Size: ${fileSize} bytes, Type: ${contentType}`);
  
  try {
    const response = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filename,
        contentType: contentType,
        fileSize: fileSize
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS: Signed URL generated`);
      console.log(`   📄 Response:`, {
        uploadUrl: result.uploadUrl ? 'Generated' : 'Missing',
        filename: result.filename,
        fileSize: result.fileSize
      });
      return { success: true, data: result };
    } else {
      console.log(`   ❌ FAILED: ${response.status} - ${result.error}`);
      return { success: false, error: result };
    }
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Función para probar el endpoint upload-video-optimized
async function testUploadOptimized(mockFile) {
  console.log(`\n🚀 Testing upload-video-optimized endpoint...`);
  console.log(`   File: ${mockFile.name}, Size: ${mockFile.size} bytes`);
  
  try {
    const formData = new FormData();
    formData.append('video', new Blob([new ArrayBuffer(mockFile.size)], { type: mockFile.type }), mockFile.name);
    formData.append('petName', 'Test Pet');
    formData.append('translation', 'Test translation');
    formData.append('emotionalDubbing', 'Test emotional output');
    formData.append('totalDuration', '30');
    formData.append('userId', 'test_user');
    formData.append('isPublic', 'true');

    const response = await fetch('/api/upload-video-optimized', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS: Video uploaded`);
      console.log(`   📄 Response:`, {
        url: result.url ? 'Generated' : 'Missing',
        filename: result.filename,
        uploadMethod: result.uploadMethod
      });
      return { success: true, data: result };
    } else {
      console.log(`   ❌ FAILED: ${response.status} - ${result.error}`);
      return { success: false, error: result };
    }
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Función principal de prueba
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE UPLOAD DIRECTO');
  console.log('=====================================');
  
  // Test cases para diferentes tamaños de archivo
  const testCases = [
    { name: 'small-video.mp4', sizeMB: 5 }, // 5MB - video corto
    { name: 'medium-video.mp4', sizeMB: 25 }, // 25MB - video mediano
    { name: 'large-video.mp4', sizeMB: 50 }, // 50MB - video largo (3-4 minutos)
    { name: 'max-video.mp4', sizeMB: 95 }, // 95MB - cerca del límite (5 minutos)
  ];
  
  let successCount = 0;
  let totalTests = 0;
  
  for (const testCase of testCases) {
    console.log(`\n📹 TESTING: ${testCase.name} (${testCase.sizeMB}MB)`);
    console.log('=' .repeat(50));
    
    const mockFile = createMockVideoFile(testCase.sizeMB, testCase.name);
    
    // Test 1: get-upload-url endpoint
    totalTests++;
    const signedUrlResult = await testGetUploadUrl(mockFile.size, mockFile.name, mockFile.type);
    if (signedUrlResult.success) successCount++;
    
    // Test 2: upload-video-optimized endpoint (simulado)
    totalTests++;
    const uploadResult = await testUploadOptimized(mockFile);
    if (uploadResult.success) successCount++;
  }
  
  // Test case para archivo demasiado grande
  console.log(`\n📹 TESTING: oversized-video.mp4 (120MB) - Should FAIL`);
  console.log('=' .repeat(50));
  
  const oversizedFile = createMockVideoFile(120, 'oversized-video.mp4');
  
  totalTests++;
  const oversizedSignedResult = await testGetUploadUrl(oversizedFile.size, oversizedFile.name, oversizedFile.type);
  if (!oversizedSignedResult.success) {
    console.log(`   ✅ CORRECTLY REJECTED: Large file was properly rejected`);
    successCount++;
  } else {
    console.log(`   ❌ SHOULD HAVE FAILED: Large file was incorrectly accepted`);
  }
  
  // Test case para datos inválidos
  console.log(`\n🔍 TESTING: Invalid data - Should FAIL`);
  console.log('=' .repeat(50));
  
  totalTests++;
  const invalidResult = await testGetUploadUrl(null, 'test.mp4', 'video/mp4');
  if (!invalidResult.success) {
    console.log(`   ✅ CORRECTLY REJECTED: Invalid fileSize was properly rejected`);
    successCount++;
  } else {
    console.log(`   ❌ SHOULD HAVE FAILED: Invalid data was incorrectly accepted`);
  }
  
  // Resultados finales
  console.log(`\n📊 RESULTADOS FINALES`);
  console.log('='.repeat(50));
  console.log(`✅ Pruebas exitosas: ${successCount}/${totalTests}`);
  console.log(`📈 Tasa de éxito: ${((successCount/totalTests) * 100).toFixed(1)}%`);
  
  if (successCount === totalTests) {
    console.log(`\n🎉 ¡TODAS LAS PRUEBAS PASARON!`);
    console.log(`✅ El upload directo funciona correctamente`);
    console.log(`✅ Videos de hasta 5 minutos son soportados`);
    console.log(`✅ Validaciones funcionan correctamente`);
  } else {
    console.log(`\n⚠️ ALGUNAS PRUEBAS FALLARON`);
    console.log(`❌ ${totalTests - successCount} pruebas no pasaron`);
    console.log(`🔧 Revisar la implementación`);
  }
}

// Función para verificar que los endpoints estén disponibles
async function checkEndpoints() {
  console.log('🔍 Verificando disponibilidad de endpoints...');
  
  const endpoints = [
    '/api/get-upload-url',
    '/api/upload-video-optimized',
    '/api/upload-video-direct'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'POST' });
      console.log(`   ${endpoint}: ${response.status === 405 ? '✅ Available' : `❌ ${response.status}`}`);
    } catch (error) {
      console.log(`   ${endpoint}: ❌ Error - ${error.message}`);
    }
  }
}

// Ejecutar las pruebas si se ejecuta directamente
if (typeof window !== 'undefined') {
  // Ejecutar en el navegador
  window.testUploadFix = {
    runTests,
    checkEndpoints,
    testGetUploadUrl,
    testUploadOptimized
  };
  console.log('🧪 Upload Fix Test Suite loaded. Run: testUploadFix.runTests()');
} else {
  // Ejecutar en Node.js (si se requiere)
  if (process.argv[2] === 'run') {
    runTests().catch(console.error);
  }
}

export { runTests, checkEndpoints, testGetUploadUrl, testUploadOptimized };
