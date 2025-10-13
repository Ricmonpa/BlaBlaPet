/**
 * Rate Limiter para proteger la API de Gemini
 * Controla el número de videos que un usuario puede procesar por día
 */

// Límite diario de videos (configurable desde env)
const DAILY_LIMIT = parseInt(import.meta.env.VITE_DAILY_VIDEO_LIMIT) || 25;
const STORAGE_KEY = 'blablapet_daily_usage';

export const rateLimiter = {
  /**
   * Verifica si el usuario puede subir un video
   * @returns {Object} { allowed: boolean, remaining: number, used: number }
   */
  canUpload: () => {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Si es un nuevo día, resetear contador
    if (data.date !== today) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        date: today, 
        count: 0 
      }));
      console.log('📅 Nuevo día - contador de videos reseteado');
      return { 
        allowed: true, 
        remaining: DAILY_LIMIT,
        used: 0
      };
    }
    
    const used = data.count || 0;
    const allowed = used < DAILY_LIMIT;
    const remaining = Math.max(0, DAILY_LIMIT - used);
    
    console.log(`📊 Rate limit check: ${used}/${DAILY_LIMIT} videos usados, ${remaining} restantes`);
    
    return { 
      allowed, 
      remaining,
      used
    };
  },
  
  /**
   * Registra que se usó un video
   */
  recordUpload: () => {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    const newCount = (data.date === today ? data.count : 0) + 1;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: today,
      count: newCount
    }));
    
    console.log(`✅ Video registrado: ${newCount}/${DAILY_LIMIT} videos usados hoy`);
  },
  
  /**
   * Obtiene estadísticas del día actual
   * @returns {Object} { used: number, remaining: number, limit: number }
   */
  getStats: () => {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (data.date !== today) {
      return { used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT };
    }
    
    const used = data.count || 0;
    return { 
      used, 
      remaining: Math.max(0, DAILY_LIMIT - used),
      limit: DAILY_LIMIT
    };
  },
  
  /**
   * Reset manual del contador (útil para debugging)
   */
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🔄 Rate limiter reseteado manualmente');
  },
  
  /**
   * Obtiene el límite configurado
   * @returns {number}
   */
  getLimit: () => DAILY_LIMIT
};
