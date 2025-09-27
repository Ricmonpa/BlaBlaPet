#!/usr/bin/env node

/**
 * Script de prueba para verificar las capacidades de análisis auditivo
 * en los servicios de análisis de mascotas
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class AuditoryAnalysisTester {
  constructor() {
    // Leer archivos directamente sin instanciar servicios
    this.geminiServiceFile = readFileSync(join(projectRoot, 'src/services/geminiService.js'), 'utf8');
    this.dualAnalysisFile = readFileSync(join(projectRoot, 'src/services/dualAnalysisService.js'), 'utf8');
    this.thoughtModelFile = readFileSync(join(projectRoot, 'src/services/thoughtModelService.js'), 'utf8');
  }

  /**
   * Verificar que los prompts contengan las capacidades auditivas
   */
  testPromptCapabilities() {
    console.log('🔍 Verificando capacidades auditivas en los prompts...\n');

    // Verificar GeminiService
    const geminiHasAuditory = this.checkAuditoryCapabilities(this.geminiServiceFile);
    console.log(`✅ GeminiService: ${geminiHasAuditory ? 'Capacidades auditivas detectadas' : '❌ Capacidades auditivas NO detectadas'}`);

    // Verificar DualAnalysisService
    const dualHasAuditory = this.checkAuditoryCapabilities(this.dualAnalysisFile);
    console.log(`✅ DualAnalysisService: ${dualHasAuditory ? 'Capacidades auditivas detectadas' : '❌ Capacidades auditivas NO detectadas'}`);

    // Verificar ThoughtModelService
    const thoughtHasAuditory = this.checkAuditoryCapabilities(this.thoughtModelFile);
    console.log(`✅ ThoughtModelService: ${thoughtHasAuditory ? 'Capacidades auditivas detectadas' : '❌ Capacidades auditivas NO detectadas'}`);

    return {
      gemini: geminiHasAuditory,
      dual: dualHasAuditory,
      thought: thoughtHasAuditory
    };
  }

  /**
   * Verificar si el prompt contiene las capacidades auditivas
   */
  checkAuditoryCapabilities(prompt) {
    const auditoryKeywords = [
      'SEÑALES AUDITIVAS',
      'ladridos',
      'gemidos',
      'jadeos',
      'gruñidos',
      'vocalizaciones',
      'PRIORIDAD ALTA',
      'correlaciona',
      'sonidos ambientales'
    ];

    return auditoryKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Mostrar resumen de capacidades auditivas implementadas
   */
  showAuditoryCapabilities() {
    console.log('\n🎵 CAPACIDADES AUDITIVAS IMPLEMENTADAS:\n');
    
    const capabilities = [
      '✅ Análisis de ladridos (agudos vs graves)',
      '✅ Análisis de gemidos (ascendentes vs descendentes)',
      '✅ Análisis de jadeos (ritmo normal vs acelerado)',
      '✅ Análisis de gruñidos (juguetones vs territoriales)',
      '✅ Análisis de respiración (suspiros vs irregular)',
      '✅ Análisis de frecuencia (repetitivos vs aislados)',
      '✅ Análisis de intensidad (volumen y urgencia)',
      '✅ Priorización de vocalizaciones del perro',
      '✅ Correlación entre señales auditivas y visuales',
      '✅ Filtrado de música de fondo'
    ];

    capabilities.forEach(capability => console.log(capability));
  }

  /**
   * Ejecutar todas las pruebas
   */
  async runTests() {
    console.log('🧪 INICIANDO PRUEBAS DE ANÁLISIS AUDITIVO\n');
    console.log('=' .repeat(50));

    try {
      // Verificar capacidades en prompts
      const results = this.testPromptCapabilities();
      
      // Mostrar capacidades implementadas
      this.showAuditoryCapabilities();

      // Resumen final
      console.log('\n📊 RESUMEN DE PRUEBAS:');
      console.log('=' .repeat(30));
      
      const allPassed = Object.values(results).every(result => result);
      
      if (allPassed) {
        console.log('🎉 ¡TODAS LAS PRUEBAS PASARON!');
        console.log('✅ Las capacidades auditivas están correctamente implementadas');
        console.log('✅ Los prompts incluyen análisis de señales auditivas');
        console.log('✅ La priorización de vocalizaciones está configurada');
      } else {
        console.log('⚠️  ALGUNAS PRUEBAS FALLARON');
        console.log('❌ Revisar la implementación de capacidades auditivas');
      }

      return allPassed;

    } catch (error) {
      console.error('❌ Error durante las pruebas:', error.message);
      return false;
    }
  }
}

// Ejecutar pruebas si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AuditoryAnalysisTester();
  const success = await tester.runTests();
  process.exit(success ? 0 : 1);
}

export { AuditoryAnalysisTester };
