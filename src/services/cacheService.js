/**
 * Servicio de Cache para Gemini API
 * Evita llamadas duplicadas y gestiona la cuota de API
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.requestCount = 0;
    this.dailyLimit = 48; // Límite más realista para cuota gratuita (dejando margen)
    this.resetTime = this.getNextResetTime();
    this.priorityQueue = []; // Cola de requests pendientes cuando se agota la cuota
  }

  // Generar clave de cache basada en el contenido
  generateCacheKey(content) {
    if (typeof content === 'string') {
      return this.hashString(content);
    }
    
    if (Array.isArray(content)) {
      // Para contenido con texto e imagen
      const textPart = content.find(part => part.text)?.text || '';
      const imagePart = content.find(part => part.inlineData);
      
      if (imagePart) {
        // Usar hash del texto + primeros caracteres del base64
        const imageHash = imagePart.inlineData.data.substring(0, 50);
        return this.hashString(textPart + imageHash);
      }
      
      return this.hashString(textPart);
    }
    
    return this.hashString(JSON.stringify(content));
  }

  // Hash simple para strings
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return hash.toString();
  }

  // Verificar si tenemos cache disponible
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Verificar si el cache no ha expirado (24 horas)
    if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    console.log('🎯 Cache hit para:', key.substring(0, 20) + '...');
    return cached.data;
  }

  // Guardar en cache
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    console.log('💾 Cache guardado para:', key.substring(0, 20) + '...');
    
    // Limpiar cache viejo si tenemos muchos elementos
    if (this.cache.size > 100) {
      this.cleanOldCache();
    }
  }

  // Limpiar cache viejo
  cleanOldCache() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    console.log('🧹 Cache limpiado, elementos restantes:', this.cache.size);
  }

  // Verificar si podemos hacer más requests
  canMakeRequest() {
    this.checkReset();
    
    if (this.requestCount >= this.dailyLimit) {
      console.warn('⚠️ Límite diario de requests alcanzado:', this.requestCount);
      return false;
    }
    
    return true;
  }

  // Verificar si podemos hacer un número específico de requests
  canMakeRequests(count) {
    this.checkReset();
    return (this.requestCount + count) <= this.dailyLimit;
  }

  // Agregar request a la cola de prioridad
  queueRequest(requestFunction, priority = 'normal') {
    this.priorityQueue.push({
      function: requestFunction,
      priority,
      timestamp: Date.now()
    });
    
    console.log(`📋 Request agregado a la cola (prioridad: ${priority}). Cola: ${this.priorityQueue.length}`);
    
    // Intentar procesar la cola
    this.processQueue();
  }

  // Procesar cola de requests pendientes
  async processQueue() {
    if (this.priorityQueue.length === 0) return;
    
    // Ordenar por prioridad y timestamp
    this.priorityQueue.sort((a, b) => {
      const priorityOrder = { 'high': 0, 'normal': 1, 'low': 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.timestamp - b.timestamp;
    });

    // Procesar mientras tengamos cuota
    while (this.priorityQueue.length > 0 && this.canMakeRequest()) {
      const request = this.priorityQueue.shift();
      try {
        await request.function();
        console.log(`✅ Request procesado desde la cola`);
      } catch (error) {
        console.error('❌ Error procesando request de la cola:', error);
      }
    }
  }

  // Incrementar contador de requests
  incrementRequestCount() {
    this.requestCount++;
    console.log(`📊 Requests hoy: ${this.requestCount}/${this.dailyLimit}`);
  }

  // Verificar si necesitamos resetear el contador
  checkReset() {
    if (Date.now() >= this.resetTime) {
      this.requestCount = 0;
      this.resetTime = this.getNextResetTime();
      console.log('🔄 Contador de requests reseteado');
    }
  }

  // Obtener próximo tiempo de reset (medianoche)
  getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  // Obtener tiempo restante hasta reset
  getTimeUntilReset() {
    const now = Date.now();
    const remaining = this.resetTime - now;
    return Math.max(0, remaining);
  }

  // Obtener estadísticas del cache
  getStats() {
    this.checkReset();
    
    return {
      cacheSize: this.cache.size,
      requestsToday: this.requestCount,
      dailyLimit: this.dailyLimit,
      remainingRequests: Math.max(0, this.dailyLimit - this.requestCount),
      timeUntilReset: this.getTimeUntilReset(),
      canMakeRequest: this.canMakeRequest()
    };
  }

  // Limpiar todo el cache
  clear() {
    this.cache.clear();
    console.log('🗑️ Cache completamente limpiado');
  }
}

export default new CacheService();
