import videoShareService from './videoShareService.js';

/**
 * Servicio de Compartir para Redes Sociales
 * Implementa Web Share API nativa + deep links para cada plataforma
 */
class ShareService {
  constructor() {
    this.isWebShareSupported = 'share' in navigator;
    this.isMobile = this.detectMobile();
    
    // Limpiar videos antiguos cada hora
    setInterval(() => {
      videoShareService.cleanupOldVideos();
    }, 60 * 60 * 1000); // 1 hora
  }

  /**
   * Detectar si es dispositivo móvil
   * @returns {boolean}
   */
  detectMobile() {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Compartir usando Web Share API nativa (móviles)
   * @param {Object} shareData - Datos a compartir
   * @returns {Promise<boolean>} - true si se compartió exitosamente
   */
  async shareWithWebAPI(shareData) {
    if (!this.isWebShareSupported) {
      return false;
    }

    try {
      await navigator.share(shareData);
      console.log('✅ Compartido exitosamente con Web Share API');
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('❌ Usuario canceló el compartir');
      } else {
        console.error('❌ Error en Web Share API:', error);
      }
      return false;
    }
  }

  /**
   * Generar URL de compartir para TikTok
   * @param {Object} post - Datos del post
   * @returns {string}
   */
  generateTikTokShareUrl(post) {
    // Generar URL única del video
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(post);
    
    const text = `¡Mira lo que dice mi perro! 🐕 "${post.translation || post.emotionalDubbing}" #YoPett #Perros #Mascotas\n\nVer video: ${videoUrl}`;
    const encodedText = encodeURIComponent(text);
    
    // Deep link para TikTok (si está instalada)
    const deepLink = `tiktok://create?text=${encodedText}`;
    
    // Fallback web
    const webUrl = `https://www.tiktok.com/upload?text=${encodedText}`;
    
    return { deepLink, webUrl, videoUrl };
  }

  /**
   * Generar URL de compartir para Instagram Reels
   * @param {Object} post - Datos del post
   * @returns {string}
   */
  generateInstagramShareUrl(post) {
    // Generar URL única del video
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(post);
    
    const text = `¡Mira lo que dice mi perro! 🐕 "${post.translation || post.emotionalDubbing}" #YoPett #Perros #Mascotas\n\nVer video: ${videoUrl}`;
    const encodedText = encodeURIComponent(text);
    
    // Deep link para Instagram (si está instalada)
    const deepLink = `instagram://create?text=${encodedText}`;
    
    // Fallback web
    const webUrl = `https://www.instagram.com/create/reel/?text=${encodedText}`;
    
    return { deepLink, webUrl, videoUrl };
  }

  /**
   * Generar URL de compartir para Facebook Shorts
   * @param {Object} post - Datos del post
   * @returns {string}
   */
  generateFacebookShareUrl(post) {
    // Generar URL única del video
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(post);
    
    const text = `¡Mira lo que dice mi perro! 🐕 "${post.translation || post.emotionalDubbing}" #YoPett #Perros #Mascotas`;
    const encodedText = encodeURIComponent(text);
    
    // Deep link para Facebook (si está instalada)
    const deepLink = `fb://create?text=${encodedText}`;
    
    // Fallback web - usar la URL del video para el preview
    const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}&quote=${encodedText}`;
    
    return { deepLink, webUrl, videoUrl };
  }

  /**
   * Generar URL de compartir para WhatsApp
   * @param {Object} post - Datos del post
   * @returns {string}
   */
  generateWhatsAppShareUrl(post) {
    // Generar URL única del video
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(post);
    
    // Generar texto optimizado para WhatsApp
    const shareText = videoShareService.generateShareText(post);
    const encodedText = encodeURIComponent(shareText);
    
    // Deep link para WhatsApp (si está instalada)
    const deepLink = `whatsapp://send?text=${encodedText}`;
    
    // Fallback web
    const webUrl = `https://wa.me/?text=${encodedText}`;
    
    return { deepLink, webUrl, videoUrl };
  }

  /**
   * Intentar abrir deep link con fallback a web
   * @param {string} deepLink - Deep link de la app
   * @param {string} webUrl - URL web de fallback
   * @returns {Promise<boolean>}
   */
  async openDeepLinkWithFallback(deepLink, webUrl) {
    try {
      // Crear iframe oculto para intentar deep link
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLink;
      document.body.appendChild(iframe);

      // Timeout para detectar si la app se abrió
      const timeout = setTimeout(() => {
        // Si no se abrió la app, usar fallback web
        window.open(webUrl, '_blank');
        document.body.removeChild(iframe);
      }, 2000);

      // Si la app se abrió, limpiar
      const cleanup = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
      };

      // Detectar si la app se abrió (evento de blur)
      window.addEventListener('blur', cleanup, { once: true });
      
      return true;
    } catch (error) {
      console.error('❌ Error abriendo deep link:', error);
      // Fallback a web
      window.open(webUrl, '_blank');
      return false;
    }
  }

  /**
   * Compartir en TikTok
   * @param {Object} post - Datos del post
   * @returns {Promise<boolean>}
   */
  async shareToTikTok(post) {
    const { deepLink, webUrl } = this.generateTikTokShareUrl(post);
    return await this.openDeepLinkWithFallback(deepLink, webUrl);
  }

  /**
   * Compartir en Instagram Reels
   * @param {Object} post - Datos del post
   * @returns {Promise<boolean>}
   */
  async shareToInstagram(post) {
    const { deepLink, webUrl } = this.generateInstagramShareUrl(post);
    return await this.openDeepLinkWithFallback(deepLink, webUrl);
  }

  /**
   * Compartir en Facebook Shorts
   * @param {Object} post - Datos del post
   * @returns {Promise<boolean>}
   */
  async shareToFacebook(post) {
    const { deepLink, webUrl } = this.generateFacebookShareUrl(post);
    return await this.openDeepLinkWithFallback(deepLink, webUrl);
  }

  /**
   * Compartir en WhatsApp
   * @param {Object} post - Datos del post
   * @returns {Promise<boolean>}
   */
  async shareToWhatsApp(post) {
    const { deepLink, webUrl } = this.generateWhatsAppShareUrl(post);
    return await this.openDeepLinkWithFallback(deepLink, webUrl);
  }

  /**
   * Compartir usando Web Share API (móviles)
   * @param {Object} post - Datos del post
   * @returns {Promise<boolean>}
   */
  async shareWithNativeAPI(post) {
    // Generar URL única del video
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(post);
    
    const shareData = {
      title: `¡Mira lo que dice ${post.petName || 'mi perro'}! 🐕`,
      text: `¡Mira lo que dice mi perro! 🐕 "${post.translation || post.emotionalDubbing}"`,
      url: videoUrl
    };

    return await this.shareWithWebAPI(shareData);
  }

  /**
   * Método principal de compartir
   * @param {string} platform - Plataforma a compartir
   * @param {Object} post - Datos del post
   * @returns {Promise<boolean>}
   */
  async share(platform, post) {
    console.log(`📤 Compartiendo en ${platform}...`);

    try {
      switch (platform) {
        case 'tiktok':
          return await this.shareToTikTok(post);
        case 'instagram':
          return await this.shareToInstagram(post);
        case 'facebook':
          return await this.shareToFacebook(post);
        case 'whatsapp':
          return await this.shareToWhatsApp(post);
        case 'native':
          return await this.shareWithNativeAPI(post);
        default:
          console.error('❌ Plataforma no soportada:', platform);
          return false;
      }
    } catch (error) {
      console.error(`❌ Error compartiendo en ${platform}:`, error);
      return false;
    }
  }

  /**
   * Obtener plataformas disponibles según el dispositivo
   * @returns {Array} Lista de plataformas disponibles
   */
  getAvailablePlatforms() {
    const platforms = [
      { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
      { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
      { id: 'facebook', name: 'Facebook', icon: '👥', color: '#1877F2' },
      { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' }
    ];

    // Si es móvil y soporta Web Share API, agregar opción nativa
    if (this.isMobile && this.isWebShareSupported) {
      platforms.unshift({ 
        id: 'native', 
        name: 'Compartir', 
        icon: '📤', 
        color: '#1ca9b1' 
      });
    }

    return platforms;
  }

  /**
   * Verificar si el servicio está disponible
   * @returns {boolean}
   */
  isAvailable() {
    return true; // Siempre disponible, con fallbacks
  }
}

export default new ShareService();
