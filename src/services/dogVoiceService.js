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
    
    // Configuración optimizada para voces de perros
    this.dogVoiceConfig = {
      rate: 1.2,    // 20% más rápido (energía de perro)
      pitch: 1.3,  // 30% más agudo (tono juguetón)
      volume: 0.8, // 80% volumen (no muy fuerte)
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
   * Seleccionar la mejor voz para perros (femenina/aguda)
   */
  selectBestDogVoice() {
    // Filtrar voces femeninas en español
    const femaleVoices = this.voices.filter(voice => 
      voice.lang.startsWith('es') && 
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('woman') ||
       voice.name.toLowerCase().includes('mujer') ||
       voice.name.toLowerCase().includes('femenina'))
    );

    if (femaleVoices.length > 0) {
      this.currentVoice = femaleVoices[0];
      console.log('🎤 Voz de perro seleccionada:', this.currentVoice.name);
    } else {
      // Fallback a cualquier voz en español
      const spanishVoices = this.voices.filter(voice => voice.lang.startsWith('es'));
      if (spanishVoices.length > 0) {
        this.currentVoice = spanishVoices[0];
        console.log('🎤 Voz de perro (fallback):', this.currentVoice.name);
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

    // Detener cualquier voz anterior
    this.stop();

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
      console.error('❌ Error en voz de perro:', event.error);
    };

    // Reproducir
    this.synthesis.speak(utterance);
  }

  /**
   * Detener voz actual
   */
  stop() {
    this.synthesis.cancel();
    this.isPlaying = false;
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
   * Probar voz con texto de ejemplo
   */
  testVoice() {
    const testText = "¡Hola! Soy un perro muy feliz y juguetón. ¿Quieres jugar conmigo?";
    this.speak(testText);
  }
}

export default new DogVoiceService();
