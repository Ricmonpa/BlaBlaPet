/**
 * Procesador por lotes para análisis de frames
 * Permite procesar videos largos sin bloquear la UI
 */
class BatchProcessor {
  constructor() {
    this.isProcessing = false;
    this.currentBatch = null;
    this.progressCallback = null;
    this.batchSize = 3; // Procesar 3 frames a la vez
    this.delayBetweenBatches = 1000; // 1 segundo entre lotes
  }

  // Procesar frames en lotes
  async processFramesInBatches(frames, processFunction, progressCallback = null) {
    this.progressCallback = progressCallback;
    this.isProcessing = true;

    try {
      console.log(`🔄 Iniciando procesamiento por lotes de ${frames.length} frames`);
      
      const results = [];
      const totalBatches = Math.ceil(frames.length / this.batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        if (!this.isProcessing) {
          console.log('⏹️ Procesamiento cancelado por el usuario');
          break;
        }

        const startIndex = batchIndex * this.batchSize;
        const endIndex = Math.min(startIndex + this.batchSize, frames.length);
        const batch = frames.slice(startIndex, endIndex);
        
        console.log(`📦 Procesando lote ${batchIndex + 1}/${totalBatches} (frames ${startIndex + 1}-${endIndex})`);
        
        // Procesar el lote actual
        const batchResults = await this.processBatch(batch, processFunction);
        results.push(...batchResults);
        
        // Actualizar progreso
        if (this.progressCallback) {
          const progress = ((batchIndex + 1) / totalBatches) * 100;
          this.progressCallback({
            progress,
            currentBatch: batchIndex + 1,
            totalBatches,
            processedFrames: results.length,
            totalFrames: frames.length
          });
        }
        
        // Delay entre lotes para no saturar la API
        if (batchIndex < totalBatches - 1) {
          console.log(`⏳ Esperando ${this.delayBetweenBatches}ms antes del siguiente lote...`);
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
        }
      }
      
      console.log(`✅ Procesamiento por lotes completado: ${results.length} frames procesados`);
      return results;
      
    } catch (error) {
      console.error('❌ Error en procesamiento por lotes:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Procesar un lote individual
  async processBatch(batch, processFunction) {
    const promises = batch.map((frame, index) => 
      this.processFrameWithRetry(frame, index, processFunction)
    );
    
    const results = await Promise.allSettled(promises);
    
    // Filtrar solo los resultados exitosos
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Procesar frame individual con retry
  async processFrameWithRetry(frame, index, processFunction, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🎬 Procesando frame ${index + 1} (intento ${attempt})`);
        const result = await processFunction(frame, index);
        return result;
      } catch (error) {
        console.warn(`⚠️ Frame ${index + 1} falló en intento ${attempt}:`, error.message);
        
        if (attempt === maxRetries) {
          console.error(`❌ Frame ${index + 1} falló completamente después de ${maxRetries} intentos`);
          return null; // Retornar null para frames que fallan
        }
        
        // Delay antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Cancelar procesamiento
  cancel() {
    this.isProcessing = false;
    console.log('🛑 Procesamiento cancelado');
  }

  // Verificar si está procesando
  isCurrentlyProcessing() {
    return this.isProcessing;
  }

  // Configurar tamaño de lote
  setBatchSize(size) {
    this.batchSize = Math.max(1, Math.min(size, 10)); // Entre 1 y 10
    console.log(`📦 Tamaño de lote configurado a: ${this.batchSize}`);
  }

  // Configurar delay entre lotes
  setDelayBetweenBatches(delay) {
    this.delayBetweenBatches = Math.max(0, delay);
    console.log(`⏳ Delay entre lotes configurado a: ${this.delayBetweenBatches}ms`);
  }
}

export default new BatchProcessor();
