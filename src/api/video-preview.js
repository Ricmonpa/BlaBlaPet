/**
 * API endpoint para generar HTML con metadatos Open Graph
 * para previews de WhatsApp
 */

import videoShareService from '../services/videoShareService.js';

export function generateVideoPreviewHTML(videoId) {
  // Obtener datos del video
  const video = videoShareService.getVideoById(videoId);
  
  if (!video) {
    return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Video no encontrado - Yo Pett</title>
    <meta property="og:title" content="Video no encontrado - Yo Pett" />
    <meta property="og:description" content="El video que buscas no existe o ha expirado" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Yo Pett" />
  </head>
  <body>
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #000; color: #fff; font-family: Arial, sans-serif; text-align: center;">
      <div>
        <h1>😿 Video no encontrado</h1>
        <p>El video que buscas no existe o ha expirado</p>
      </div>
    </div>
  </body>
</html>`;
  }

  // Generar metadatos
  const title = `¡Mira lo que dice ${video.petName || 'mi mascota'}! 🐕`;
  const description = video.translation || video.emotionalDubbing || 'Análisis de comportamiento de mascota';
  const image = video.mediaUrl;
  const url = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/video/${video.id}`;

  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Título -->
    <title>${title}</title>
    
    <!-- Metadatos Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="video.other" />
    <meta property="og:site_name" content="Yo Pett" />
    <meta property="og:locale" content="es_ES" />
    
    <!-- Metadatos Twitter -->
    <meta name="twitter:card" content="player" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:player" content="${url}" />
    <meta name="twitter:player:width" content="400" />
    <meta name="twitter:player:height" content="600" />
    
    <!-- Metadatos adicionales para WhatsApp -->
    <meta property="og:image:width" content="400" />
    <meta property="og:image:height" content="600" />
    <meta property="og:image:type" content="image/jpeg" />
    
    <!-- Redirección a la app real -->
    <script>
      setTimeout(() => {
        window.location.href = '/#/video/${videoId}';
      }, 100);
    </script>
  </head>
  <body>
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #000; color: #fff; font-family: Arial, sans-serif; text-align: center;">
      <div>
        <h1>🐕 ${title}</h1>
        <p style="font-size: 18px; margin: 20px 0;">"${description}"</p>
        <p style="font-size: 14px; color: #ccc;">Redirigiendo a Yo Pett...</p>
      </div>
    </body>
</html>`;
}
