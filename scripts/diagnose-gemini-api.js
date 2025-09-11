// Script de diagnóstico para verificar el estado de la API de Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

class GeminiDiagnostic {
  constructor() {
    this.apiKey = process.env.VITE_GEMINI_API_KEY;
    this.results = {
      apiKeyStatus: 'unknown',
      connectivity: 'unknown',
      quotaStatus: 'unknown',
      modelStatus: 'unknown',
      errors: []
    };
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
      
      // Prueba simple con texto
      const result = await model.generateContent("Responde solo 'OK'");
      const response = await result.response;
      const text = response.text();
      
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
      
      // Analizar tipo de error
      if (error.message.includes('403')) {
        this.results.errors.push('Error 403: Posible problema de permisos o cuota excedida');
      } else if (error.message.includes('429')) {
        this.results.errors.push('Error 429: Límite de velocidad excedido');
      } else if (error.message.includes('503')) {
        this.results.errors.push('Error 503: Servicio temporalmente no disponible');
      } else if (error.message.includes('401')) {
        this.results.errors.push('Error 401: API Key inválida o expirada');
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
      
      // Hacer múltiples requests para probar límites
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          model.generateContent(`Prueba ${i + 1}: Responde solo el número ${i + 1}`)
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.response.text().trim() !== '');
      
      if (successful.length === 5) {
        this.results.quotaStatus = 'healthy';
        console.log('✅ Cuota disponible - 5/5 requests exitosos');
      } else {
        this.results.quotaStatus = 'limited';
        this.results.errors.push(`Solo ${successful.length}/5 requests exitosos`);
        console.log(`⚠️ Cuota limitada - ${successful.length}/5 requests exitosos`);
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
      
      // Probar con prompt similar al que usas en la app
      const prompt = `Eres un analista de comportamiento canino. Analiza esta descripción: "Un perro jugando con un juguete". Responde en formato JSON con: {"comportamiento": "descripción", "emocion": "estado emocional"}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Verificar si la respuesta es JSON válido
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          JSON.parse(jsonMatch[0]);
          this.results.modelStatus = 'working';
          console.log('✅ Modelo funcionando correctamente');
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
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    
    if (this.results.apiKeyStatus !== 'valid') {
      console.log('- Configura una API Key válida de Gemini en tu archivo .env');
      console.log('- Obtén tu API Key en: https://aistudio.google.com/app/apikey');
    }
    
    if (this.results.connectivity === 'failed') {
      console.log('- Verifica tu conexión a internet');
      console.log('- Revisa si hay problemas de firewall o proxy');
    }
    
    if (this.results.quotaStatus === 'limited' || this.results.quotaStatus === 'error') {
      console.log('- Verifica tu plan de facturación en Google AI Studio');
      console.log('- Revisa si has excedido los límites de cuota');
      console.log('- Considera actualizar tu plan si es necesario');
    }
    
    if (this.results.modelStatus === 'failed') {
      console.log('- El modelo gemini-1.5-flash puede estar temporalmente no disponible');
      console.log('- Intenta usar gemini-1.5-pro como alternativa');
    }
    
    // Guardar reporte en archivo
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      recommendations: this.getRecommendations()
    };
    
    fs.writeFileSync('gemini-diagnostic-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Reporte guardado en: gemini-diagnostic-report.json');
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.results.apiKeyStatus !== 'valid') {
      recommendations.push('Configurar API Key válida');
    }
    
    if (this.results.connectivity === 'failed') {
      recommendations.push('Verificar conectividad de red');
    }
    
    if (this.results.quotaStatus === 'limited') {
      recommendations.push('Revisar límites de cuota');
    }
    
    if (this.results.modelStatus === 'failed') {
      recommendations.push('Considerar modelo alternativo');
    }
    
    return recommendations;
  }
}

// Ejecutar diagnóstico
const diagnostic = new GeminiDiagnostic();
diagnostic.runDiagnostic().catch(console.error);
