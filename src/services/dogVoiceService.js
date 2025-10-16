/**
 * Servicio de Text-to-Speech para voces de perros
 * Utiliza Web Speech API nativa del navegador
 */

class DogVoiceService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.isEnabled = true;
    this.isPlaying = false;
    this.lastSpeakTime = 0;
    this.lastSpokenText = '';
    
    // Configuración optimizada para voz de Dug (Up)
    this.dogVoiceConfig = {
      rate: 1.4,    // 40% más rápido (energía de Dug)
      pitch: 1.6,   // 60% más agudo (entusiasmo de Dug)
      volume: 1.0,  // 100% volumen (como solicitaste)
      lang: 'es-ES' // Español
    };
    
    this.loadVoices();
  }

  /**
   * Cargar voces disponibles del navegador
   */
  loadVoices() {
    // Las voces pueden tardar en cargarse
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis.getVoices();
        this.selectBestDogVoice();
      });
    } else {
      this.voices = this.synthesis.getVoices();
      this.selectBestDogVoice();
    }
  }

  /**
   * Seleccionar la mejor voz para perros (masculina como Dug)
   */
  selectBestDogVoice() {
    // Filtrar voces masculinas en español (como Dug)
    const maleVoices = this.voices.filter(voice => 
      voice.lang.startsWith('es') && 
      (voice.name.toLowerCase().includes('male') || 
       voice.name.toLowerCase().includes('man') ||
       voice.name.toLowerCase().includes('hombre') ||
       voice.name.toLowerCase().includes('masculino'))
    );

    if (maleVoices.length > 0) {
      this.currentVoice = maleVoices[0];
      console.log('🎤 Voz de Dug seleccionada:', this.currentVoice.name);
    } else {
      // Fallback a cualquier voz en español
      const spanishVoices = this.voices.filter(voice => voice.lang.startsWith('es'));
      if (spanishVoices.length > 0) {
        this.currentVoice = spanishVoices[0];
        console.log('🎤 Voz de Dug (fallback):', this.currentVoice.name);
      }
    }
  }

  /**
   * Hablar texto con voz de perro
   * @param {string} text - Texto a pronunciar
   * @param {Object} options - Opciones adicionales
   */
  speak(text, options = {}) {
    if (!this.isEnabled || !text) return;

    // DEBOUNCE: Evitar llamadas múltiples en 100ms (más permisivo para feed)
    const now = Date.now();
    if (now - this.lastSpeakTime < 100) {
      console.log('🚫 Llamada muy rápida, ignorando');
      return;
    }

    // CONTROL DE ESTADO: Solo una voz a la vez
    if (this.isPlaying) {
      console.log('🚫 Ya hay una voz activa, ignorando');
      return;
    }

    // VALIDACIÓN DE TEXTO: Permitir textos similares en feed (menos estricto)
    if (text === this.lastSpokenText) {
      console.log('🚫 Texto exactamente duplicado, ignorando');
      return;
    }

    if (text.length < 2) {
      console.log('🚫 Texto muy corto, ignorando');
      return;
    }

    // CANCELACIÓN SUAVE: Solo cancelar si hay voces activas
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    
    // Esperar un momento para cancelación
    setTimeout(() => {
      // Actualizar estado
      this.lastSpeakTime = now;
      this.lastSpokenText = text;

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Aplicar configuración de voz de perro
      utterance.rate = options.rate || this.dogVoiceConfig.rate;
      utterance.pitch = options.pitch || this.dogVoiceConfig.pitch;
      utterance.volume = options.volume || this.dogVoiceConfig.volume;
      utterance.lang = this.dogVoiceConfig.lang;
      
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }

      // Eventos
      utterance.onstart = () => {
        this.isPlaying = true;
        console.log('🎤 Perro hablando:', text);
      };

      utterance.onend = () => {
        this.isPlaying = false;
        console.log('🎤 Perro terminó de hablar');
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        
        // En mobile, 'not-allowed' es esperado cuando no hay interacción del usuario
        if (event.error === 'not-allowed') {
          console.log('ℹ️ TTS bloqueado por el navegador (requiere interacción del usuario en mobile)');
          // Silenciar error - es comportamiento esperado en mobile
          return;
        }
        
        // Solo mostrar otros errores
        if (event.error !== 'canceled') {
          console.error('❌ Error en voz de perro:', event.error);
        }
      };

      // Reproducir
      this.synthesis.speak(utterance);
    }, 50); // 50ms de delay (reducido)
  }

  /**
   * Detener voz actual
   */
  stop() {
    this.synthesis.cancel();
    this.synthesis.pause();
    this.synthesis.resume();
    this.isPlaying = false;
    this.lastSpokenText = ''; // Limpiar texto anterior
  }

  /**
   * Pausar voz actual
   */
  pause() {
    this.synthesis.pause();
  }

  /**
   * Reanudar voz pausada
   */
  resume() {
    this.synthesis.resume();
  }

  /**
   * Habilitar/deshabilitar voces de perro
   * @param {boolean} enabled - Estado de habilitación
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
    console.log('🎤 Voces de perro:', enabled ? 'activadas' : 'desactivadas');
  }

  /**
   * Actualizar configuración de voz
   * @param {Object} config - Nueva configuración
   */
  updateConfig(config) {
    this.dogVoiceConfig = { ...this.dogVoiceConfig, ...config };
    console.log('🎤 Configuración de voz actualizada:', this.dogVoiceConfig);
  }

  /**
   * Obtener estado actual
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isPlaying: this.isPlaying,
      currentVoice: this.currentVoice?.name || 'Por defecto',
      config: this.dogVoiceConfig
    };
  }

  /**
   * Probar voz con texto de ejemplo (estilo Dug)
   */
  testVoice() {
    const testText = "¡Hola! Soy Dug, el perro más feliz del mundo. ¡Me encanta jugar y soy muy bueno en esto!";
    this.speak(testText);
  }
}

export default new DogVoiceService();
