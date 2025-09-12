/**
 * API endpoint para generar HTML con metadatos Open Graph dinámicos
 * para previews de WhatsApp
 * Ahora lee datos reales desde la base de datos
 */

export function generateVideoPreviewHTML(videoId, video = null, metaData = null) {
  const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
  
  // Usar metadatos dinámicos si están disponibles, sino usar valores por defecto
  const title = metaData?.title || '¡Mira lo que dice mi mascota! 🐕 - Yo Pett';
  const ogTitle = metaData?.ogTitle || '¡Mira lo que dice mi mascota! 🐕';
  const description = metaData?.description || 'Análisis de comportamiento de mascota con Yo Pett - Traductor de mascotas';
  const image = metaData?.image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop';
  const url = metaData?.url || `${baseUrl}/api/video-preview/${videoId}`;
  const imageWidth = metaData?.imageWidth || '400';
  const imageHeight = metaData?.imageHeight || '600';
  const imageType = metaData?.imageType || 'image/jpeg';
  
  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Metadatos Open Graph dinámicos que WhatsApp puede leer -->
    <title>${title}</title>
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="video.other" />
    <meta property="og:site_name" content="Yo Pett" />
    <meta property="og:locale" content="es_ES" />
    
    <!-- Metadatos Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    <!-- Metadatos adicionales para WhatsApp -->
    <meta property="og:image:width" content="${imageWidth}" />
    <meta property="og:image:height" content="${imageHeight}" />
    <meta property="og:image:type" content="${imageType}" />
    
    <script>
      // Los metadatos ya se generaron dinámicamente en el servidor
      // Solo necesitamos redirigir a la app después de un breve delay
      console.log('✅ Metadatos generados dinámicamente en el servidor');
      console.log('📱 Redirigiendo a la aplicación...');
      
      // Redirigir a la app principal después de 2 segundos
      setTimeout(() => {
        window.location.href = '${baseUrl}/';
      }, 2000);
    </script>
  </head>
  <body>
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #000; color: #fff; font-family: Arial, sans-serif; text-align: center;">
      <div>
        <h1>🐕 ${ogTitle} 🐕</h1>
        <p style="font-size: 18px; margin: 20px 0;">${description}</p>
        
        <!-- Preview del video -->
        <div style="margin: 20px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
          <img src="${image}" alt="Video de mascota" style="width: 100%; max-width: 400px; height: auto; display: block;" />
        </div>
        
        <p style="font-size: 14px; color: #ccc;">Redirigiendo a la aplicación...</p>
      </div>
    </div>
  </body>
</html>`;
}