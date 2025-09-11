// Script de diagnóstico simplificado para verificar el estado de la API de Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiDiagnostic {
  constructor() {
    // Intentar obtener API key de diferentes fuentes
    this.apiKey = this.getApiKey();
    this.results = {
      apiKeyStatus: 'unknown',
      connectivity: 'unknown',
      quotaStatus: 'unknown',
      modelStatus: 'unknown',
      errors: []
    };
  }

  getApiKey() {
    // Intentar obtener de diferentes fuentes
    const sources = [
      process.env.VITE_GEMINI_API_KEY,
      process.env.GEMINI_API_KEY,
      // También podrías leer de un archivo .env manualmente
    ];
    
    for (const key of sources) {
      if (key && key !== 'your_gemini_api_key_here' && key.length > 20) {
        return key;
      }
    }
    
    return null;
  }

  async runDiagnostic() {
    console.log('🔍 Iniciando diagnóstico de Gemini API...\n');
    
    // 1. Verificar API Key
    await this.checkApiKey();
    
    // 2. Verificar conectividad básica
    await this.checkConnectivity();
    
    // 3. Verificar cuota y límites
    await this.checkQuota();
    
    // 4. Probar modelo específico
    await this.testModel();
    
    // 5. Generar reporte
    this.generateReport();
  }

  async checkApiKey() {
    console.log('1️⃣ Verificando API Key...');
    
    if (!this.apiKey) {
      this.results.apiKeyStatus = 'missing';
      this.results.errors.push('API Key no encontrada en variables de entorno');
      console.log('❌ API Key no encontrada');
      console.log('💡 Configura VITE_GEMINI_API_KEY en tu archivo .env');
      return;
    }
    
    if (this.apiKey === 'your_gemini_api_key_here') {
      this.results.apiKeyStatus = 'placeholder';
      this.results.errors.push('API Key es un placeholder, no está configurada');
      console.log('❌ API Key es un placeholder');
      return;
    }
    
    if (this.apiKey.length < 20) {
      this.results.apiKeyStatus = 'invalid_format';
      this.results.errors.push('API Key parece tener formato inválido (muy corta)');
      console.log('❌ API Key parece inválida (muy corta)');
      return;
    }
    
    this.results.apiKeyStatus = 'valid';
    console.log('✅ API Key encontrada y parece válida');
    console.log(`🔑 Key: ${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}`);
  }

  async checkConnectivity() {
    console.log('\n2️⃣ Verificando conectividad...');
    
    if (this.results.apiKeyStatus !== 'valid') {
      this.results.connectivity = 'skipped';
      console.log('⏭️ Saltando verificación de conectividad (API Key inválida)');
      return;
    }
    
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      console.log('📤 Enviando solicitud de prueba...');
      
      // Prueba simple con texto
      const result = await model.generateContent("Responde solo 'OK'");
      const response = await result.response;
      const text = response.text();
      
      console.log(`📥 Respuesta recibida: "${text}"`);
      
      if (text && text.trim().toLowerCase().includes('ok')) {
        this.results.connectivity = 'success';
        console.log('✅ Conectividad exitosa');
      } else {
        this.results.connectivity = 'unexpected_response';
        this.results.errors.push('Respuesta inesperada del modelo');
        console.log('⚠️ Conectividad exitosa pero respuesta inesperada');
      }
    } catch (error) {
      this.results.connectivity = 'failed';
      this.results.errors.push(`Error de conectividad: ${error.message}`);
      console.log(`❌ Error de conectividad: ${error.message}`);
      
      // Analizar tipo de error específico
      if (error.message.includes('403')) {
        this.results.errors.push('Error 403: Posible problema de permisos o cuota excedida');
        console.log('💡 Verifica tu plan de facturación en Google AI Studio');
      } else if (error.message.includes('429')) {
        this.results.errors.push('Error 429: Límite de velocidad excedido');
        console.log('💡 Espera unos minutos antes de hacer más requests');
      } else if (error.message.includes('503')) {
        this.results.errors.push('Error 503: Servicio temporalmente no disponible');
        console.log('💡 Gemini está sobrecargado, intenta más tarde');
      } else if (error.message.includes('401')) {
        this.results.errors.push('Error 401: API Key inválida o expirada');
        console.log('💡 Verifica que tu API Key sea correcta y esté activa');
      } else if (error.message.includes('400')) {
        this.results.errors.push('Error 400: Solicitud malformada');
        console.log('💡 Problema con el formato de la solicitud');
      }
    }
  }

  async checkQuota() {
    console.log('\n3️⃣ Verificando cuota y límites...');
    
    if (this.results.connectivity !== 'success') {
      this.results.quotaStatus = 'skipped';
      console.log('⏭️ Saltando verificación de cuota (sin conectividad)');
      return;
    }
    
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      console.log('📊 Probando límites de cuota...');
      
      // Hacer múltiples requests para probar límites
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          model.generateContent(`Prueba ${i + 1}: Responde solo el número ${i + 1}`)
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => {
        try {
          const text = r.response.text();
          return text && text.trim() !== '';
        } catch (e) {
          return false;
        }
      });
      
      if (successful.length === 3) {
        this.results.quotaStatus = 'healthy';
        console.log('✅ Cuota disponible - 3/3 requests exitosos');
      } else {
        this.results.quotaStatus = 'limited';
        this.results.errors.push(`Solo ${successful.length}/3 requests exitosos`);
        console.log(`⚠️ Cuota limitada - ${successful.length}/3 requests exitosos`);
      }
    } catch (error) {
      this.results.quotaStatus = 'error';
      this.results.errors.push(`Error verificando cuota: ${error.message}`);
      console.log(`❌ Error verificando cuota: ${error.message}`);
    }
  }

  async testModel() {
    console.log('\n4️⃣ Probando modelo gemini-1.5-flash...');
    
    if (this.results.connectivity !== 'success') {
      this.results.modelStatus = 'skipped';
      console.log('⏭️ Saltando prueba de modelo (sin conectividad)');
      return;
    }
    
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.2,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      });
      
      console.log('🤖 Probando análisis de comportamiento canino...');
      
      // Probar con prompt similar al que usas en la app
      const prompt = `Eres un analista de comportamiento canino. Analiza esta descripción: "Un perro jugando con un juguete". Responde en formato JSON con: {"comportamiento": "descripción", "emocion": "estado emocional"}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`📝 Respuesta del modelo: ${text.substring(0, 200)}...`);
      
      // Verificar si la respuesta es JSON válido
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.comportamiento && parsed.emocion) {
            this.results.modelStatus = 'working';
            console.log('✅ Modelo funcionando correctamente');
            console.log(`🐕 Comportamiento detectado: ${parsed.comportamiento}`);
            console.log(`😊 Emoción detectada: ${parsed.emocion}`);
          } else {
            this.results.modelStatus = 'incomplete_json';
            this.results.errors.push('JSON incompleto del modelo');
            console.log('⚠️ JSON incompleto del modelo');
          }
        } else {
          this.results.modelStatus = 'unexpected_format';
          this.results.errors.push('Modelo no devuelve formato JSON esperado');
          console.log('⚠️ Modelo no devuelve formato JSON esperado');
        }
      } catch (parseError) {
        this.results.modelStatus = 'json_error';
        this.results.errors.push('Error parseando JSON del modelo');
        console.log('❌ Error parseando JSON del modelo');
      }
    } catch (error) {
      this.results.modelStatus = 'failed';
      this.results.errors.push(`Error probando modelo: ${error.message}`);
      console.log(`❌ Error probando modelo: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 REPORTE DE DIAGNÓSTICO');
    console.log('='.repeat(50));
    
    console.log(`\n🔑 API Key: ${this.results.apiKeyStatus.toUpperCase()}`);
    console.log(`🌐 Conectividad: ${this.results.connectivity.toUpperCase()}`);
    console.log(`📊 Cuota: ${this.results.quotaStatus.toUpperCase()}`);
    console.log(`🤖 Modelo: ${this.results.modelStatus.toUpperCase()}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ No se encontraron errores');
    }
    
    // Recomendaciones específicas
    console.log('\n💡 RECOMENDACIONES:');
    
    if (this.results.apiKeyStatus !== 'valid') {
      console.log('- Configura una API Key válida de Gemini en tu archivo .env');
      console.log('- Obtén tu API Key en: https://aistudio.google.com/app/apikey');
      console.log('- Asegúrate de que el archivo .env esté en la raíz del proyecto');
    }
    
    if (this.results.connectivity === 'failed') {
      console.log('- Verifica tu conexión a internet');
      console.log('- Revisa si hay problemas de firewall o proxy');
      console.log('- Intenta desde una red diferente');
    }
    
    if (this.results.quotaStatus === 'limited' || this.results.quotaStatus === 'error') {
      console.log('- Verifica tu plan de facturación en Google AI Studio');
      console.log('- Revisa si has excedido los límites de cuota diarios/mensuales');
      console.log('- Considera actualizar tu plan si es necesario');
      console.log('- Revisa tu historial de uso en: https://aistudio.google.com/app/apikey');
    }
    
    if (this.results.modelStatus === 'failed') {
      console.log('- El modelo gemini-1.5-flash puede estar temporalmente no disponible');
      console.log('- Intenta usar gemini-1.5-pro como alternativa');
      console.log('- Verifica el estado del servicio en: https://status.cloud.google.com/');
    }
    
    // Diagnóstico específico para el error 503
    if (this.results.errors.some(e => e.includes('503'))) {
      console.log('\n🚨 DIAGNÓSTICO ESPECÍFICO PARA ERROR 503:');
      console.log('- Error 503 = "Service Unavailable" = Servicio temporalmente no disponible');
      console.log('- Esto NO es un problema de facturación o API Key');
      console.log('- Es un problema temporal del servidor de Google');
      console.log('- Soluciones:');
      console.log('  1. Esperar 5-10 minutos y reintentar');
      console.log('  2. Implementar lógica de reintentos en tu código');
      console.log('  3. Usar un modelo alternativo (gemini-1.5-pro)');
      console.log('  4. Verificar el estado del servicio en Google Cloud Status');
    }
  }
}

// Ejecutar diagnóstico
const diagnostic = new GeminiDiagnostic();
diagnostic.runDiagnostic().catch(console.error);
