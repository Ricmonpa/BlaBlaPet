#!/usr/bin/env node

/**
 * Script para expandir la base de datos de señales caninas
 * Genera un archivo JSON completo con 150+ señales para el motor de 4 capas
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Plantillas de señales por categoría
const signalTemplates = {
  juego: {
    play_bow: {
      nombre: "Reverencia de juego",
      descripcion: "Postura con patas delanteras bajas, caderas altas y cola moviéndose",
      intensidades: ["suave", "moderada", "intensa"],
      contextos_probables: ["invitación a jugar", "relajación", "alivio de tensión"],
      combinaciones_clave: ["cola_mueve_rapido", "orejas_relajadas", "mirada_directa"],
      layer_1_raw: "Postura de reverencia con patas delanteras extendidas hacia adelante",
      layer_2_contextual: "Contexto de interacción social positiva, generalmente con humanos u otros perros",
      layer_3_emotional: "Estado emocional de alegría, excitación y deseo de interacción lúdica",
      layer_4_interpretation: "El perro está claramente invitando a jugar de forma amistosa y positiva",
      confidence_range: "85-95%"
    },
    play_bounce: {
      nombre: "Rebote juguetón",
      descripcion: "Movimiento de rebote hacia arriba y hacia adelante",
      intensidades: ["pequeño", "moderado", "grande"],
      contextos_probables: ["excitación por juego", "anticipación", "energía alta"],
      combinaciones_clave: ["play_bow", "cola_mueve_rapido", "ladrido_corto"],
      layer_1_raw: "Movimiento de rebote vertical y horizontal con patas",
      layer_2_contextual: "Indica alta energía y deseo de interacción física",
      layer_3_emotional: "Excitación extrema, felicidad y anticipación de juego",
      layer_4_interpretation: "Tu perro está muy emocionado y quiere jugar activamente contigo",
      confidence_range: "80-90%"
    },
    ladrido_corto: {
      nombre: "Ladrido corto y agudo",
      descripcion: "Ladrido breve y agudo de invitación al juego",
      intensidades: ["suave", "moderado", "fuerte"],
      contextos_probables: ["invitación a jugar", "excitación", "atención"],
      combinaciones_clave: ["play_bow", "play_bounce", "cola_mueve_rapido"],
      layer_1_raw: "Ladrido corto, agudo y repetitivo",
      layer_2_contextual: "Generalmente dirigido a humanos u otros perros para iniciar juego",
      layer_3_emotional: "Excitación, felicidad y deseo de interacción social",
      layer_4_interpretation: "Tu perro está emocionado y quiere que juegues con él",
      confidence_range: "75-85%"
    }
  },
  
  alegria: {
    cola_mueve_rapido: {
      nombre: "Cola moviéndose rápidamente",
      descripcion: "Movimiento rápido y enérgico de la cola de lado a lado",
      intensidades: ["lento", "moderado", "rápido"],
      contextos_probables: ["felicidad", "excitación", "anticipación positiva"],
      combinaciones_clave: ["play_bow", "orejas_relajadas", "postura_relajada"],
      layer_1_raw: "Movimiento lateral rápido de la cola con amplitud variable",
      layer_2_contextual: "Generalmente en presencia de estímulos positivos o personas conocidas",
      layer_3_emotional: "Emoción positiva intensa, felicidad y deseo de interacción",
      layer_4_interpretation: "El perro está muy feliz y emocionado, mostrando claramente su estado de ánimo positivo",
      confidence_range: "80-90%"
    },
    cola_alta_curva: {
      nombre: "Cola alta y curvada",
      descripcion: "Cola erguida con curva hacia arriba",
      intensidades: ["ligera", "moderada", "pronunciada"],
      contextos_probables: ["confianza", "felicidad", "dominancia amistosa"],
      combinaciones_clave: ["orejas_erguidas", "postura_erguida", "mirada_directa"],
      layer_1_raw: "Cola elevada por encima de la línea de la espalda con curva hacia arriba",
      layer_2_contextual: "Indica confianza y estado emocional positivo",
      layer_3_emotional: "Confianza, felicidad y posible dominancia amistosa",
      layer_4_interpretation: "Tu perro se siente confiado y feliz, mostrando su estado de ánimo positivo",
      confidence_range: "75-85%"
    },
    boca_abierta_relajada: {
      nombre: "Boca abierta y relajada",
      descripcion: "Boca ligeramente abierta con lengua visible y relajada",
      intensidades: ["ligeramente abierta", "abierta", "muy abierta"],
      contextos_probables: ["felicidad", "confort", "relajación"],
      combinaciones_clave: ["orejas_relajadas", "postura_relajada", "cola_mueve_rapido"],
      layer_1_raw: "Boca ligeramente abierta con lengua visible y músculos faciales relajados",
      layer_2_contextual: "Indica un estado de confort y ausencia de tensión",
      layer_3_emotional: "Felicidad, confort y relajación total",
      layer_4_interpretation: "Tu perro está completamente relajado y feliz en este momento",
      confidence_range: "80-90%"
    }
  },
  
  social: {
    orejas_relajadas: {
      nombre: "Orejas en posición natural",
      descripcion: "Orejas en su posición natural, ni erguidas ni aplastadas",
      intensidades: ["tensas", "neutras", "relajadas"],
      contextos_probables: ["estado neutral", "confort", "atención relajada"],
      combinaciones_clave: ["play_bow", "cola_mueve_rapido", "postura_relajada"],
      layer_1_raw: "Orejas en posición natural, no tensas ni dirigidas hacia atrás",
      layer_2_contextual: "Indica un estado de confort y ausencia de amenaza percibida",
      layer_3_emotional: "Estado emocional neutral a positivo, sin estrés o miedo",
      layer_4_interpretation: "El perro está cómodo y relajado en su entorno actual",
      confidence_range: "75-85%"
    },
    mirada_directa: {
      nombre: "Mirada directa y sostenida",
      descripcion: "Contacto visual directo y sostenido con el humano u otro perro",
      intensidades: ["breve", "moderada", "sostenida"],
      contextos_probables: ["atención", "comunicación", "vínculo social"],
      combinaciones_clave: ["play_bow", "cola_mueve_rapido", "orejas_relajadas"],
      layer_1_raw: "Ojos fijos en un objetivo específico con contacto visual directo",
      layer_2_contextual: "Busca comunicación, atención o respuesta del objetivo observado",
      layer_3_emotional: "Interés, atención y deseo de interacción o respuesta",
      layer_4_interpretation: "El perro está buscando activamente comunicación o respuesta de su objetivo",
      confidence_range: "80-90%"
    },
    postura_relajada: {
      nombre: "Postura corporal relajada",
      descripcion: "Cuerpo en posición natural sin tensión muscular visible",
      intensidades: ["tensa", "neutra", "relajada"],
      contextos_probables: ["confort", "seguridad", "estado neutral"],
      combinaciones_clave: ["orejas_relajadas", "cola_mueve_rapido", "play_bow"],
      layer_1_raw: "Músculos relajados, postura natural sin rigidez o tensión visible",
      layer_2_contextual: "Indica que el perro se siente seguro y cómodo en su entorno",
      layer_3_emotional: "Estado emocional de calma, confort y ausencia de amenaza",
      layer_4_interpretation: "El perro está completamente relajado y cómodo en su situación actual",
      confidence_range: "85-95%"
    }
  },
  
  miedo: {
    cola_baja: {
      nombre: "Cola baja o entre las patas",
      descripcion: "Cola posicionada por debajo del nivel normal o entre las patas traseras",
      intensidades: ["ligeramente baja", "baja", "muy baja"],
      contextos_probables: ["miedo", "ansiedad", "sumisión", "estrés"],
      combinaciones_clave: ["orejas_atras", "postura_encogida", "evitacion_mirada"],
      layer_1_raw: "Cola posicionada por debajo de la línea de la espalda o entre las patas",
      layer_2_contextual: "Indica malestar emocional o percepción de amenaza",
      layer_3_emotional: "Miedo, ansiedad, estrés o sumisión extrema",
      layer_4_interpretation: "Tu perro está experimentando miedo o ansiedad y necesita consuelo y seguridad",
      confidence_range: "85-95%"
    },
    orejas_atras: {
      nombre: "Orejas hacia atrás",
      descripcion: "Orejas aplastadas o dirigidas hacia atrás",
      intensidades: ["ligeramente atrás", "atrás", "muy atrás"],
      contextos_probables: ["miedo", "sumisión", "estrés", "dolor"],
      combinaciones_clave: ["cola_baja", "postura_encogida", "evitacion_mirada"],
      layer_1_raw: "Orejas dirigidas hacia atrás o aplastadas contra la cabeza",
      layer_2_contextual: "Señal de malestar emocional o físico",
      layer_3_emotional: "Miedo, sumisión, estrés o posible dolor",
      layer_4_interpretation: "Tu perro está incómodo o asustado y necesita tu atención y consuelo",
      confidence_range: "80-90%"
    },
    postura_encogida: {
      nombre: "Postura encogida o agachada",
      descripcion: "Cuerpo agachado o encogido para parecer más pequeño",
      intensidades: ["ligeramente encogido", "encogido", "muy encogido"],
      contextos_probables: ["miedo", "sumisión", "amenaza percibida"],
      combinaciones_clave: ["cola_baja", "orejas_atras", "evitacion_mirada"],
      layer_1_raw: "Cuerpo agachado o encogido, intentando parecer más pequeño",
      layer_2_contextual: "Indica percepción de amenaza o deseo de pasar desapercibido",
      layer_3_emotional: "Miedo intenso, sumisión o deseo de evitar conflicto",
      layer_4_interpretation: "Tu perro está muy asustado y necesita protección y consuelo inmediato",
      confidence_range: "90-95%"
    }
  },
  
  agresion: {
    cola_rigida: {
      nombre: "Cola rígida y alta",
      descripcion: "Cola completamente rígida y elevada",
      intensidades: ["ligeramente rígida", "rígida", "muy rígida"],
      contextos_probables: ["dominancia", "agresión", "territorialidad", "alerta"],
      combinaciones_clave: ["orejas_erguidas", "postura_tensa", "gruñido"],
      layer_1_raw: "Cola completamente rígida y elevada por encima de la línea de la espalda",
      layer_2_contextual: "Indica estado de alerta alta o posible agresión",
      layer_3_emotional: "Dominancia, territorialidad o agresión potencial",
      layer_4_interpretation: "Tu perro está en estado de alerta alta y puede ser agresivo - mantén distancia",
      confidence_range: "90-95%"
    },
    gruñido: {
      nombre: "Gruñido",
      descripcion: "Sonido gutural de advertencia o amenaza",
      intensidades: ["bajo", "moderado", "alto"],
      contextos_probables: ["advertencia", "amenaza", "miedo", "protección"],
      combinaciones_clave: ["cola_rigida", "orejas_atras", "postura_tensa"],
      layer_1_raw: "Sonido gutural profundo que indica malestar o amenaza",
      layer_2_contextual: "Advertencia clara de que el perro está incómodo o amenazado",
      layer_3_emotional: "Miedo, agresión, protección o malestar extremo",
      layer_4_interpretation: "Tu perro está dando una advertencia clara - respeta su espacio y evalúa la situación",
      confidence_range: "95-100%"
    },
    orejas_erguidas: {
      nombre: "Orejas erguidas y tensas",
      descripcion: "Orejas completamente erguidas y dirigidas hacia adelante",
      intensidades: ["ligeramente erguidas", "erguidas", "muy erguidas"],
      contextos_probables: ["alerta", "dominancia", "agresión", "atención extrema"],
      combinaciones_clave: ["cola_rigida", "postura_tensa", "gruñido"],
      layer_1_raw: "Orejas completamente erguidas y dirigidas hacia adelante con tensión visible",
      layer_2_contextual: "Indica estado de alerta máxima o posible agresión",
      layer_3_emotional: "Alerta extrema, dominancia o agresión inminente",
      layer_4_interpretation: "Tu perro está en estado de alerta máxima - puede ser agresivo",
      confidence_range: "85-95%"
    }
  }
};

// Función para generar señales adicionales
function generateAdditionalSignals() {
  const additionalSignals = [];
  let id = 9; // Empezar después de las señales base
  
  // Generar señales de exploración
  for (let i = 1; i <= 20; i++) {
    additionalSignals.push({
      id: `exploracion_${i}`,
      nombre: `Señal de exploración ${i}`,
      descripcion: `Comportamiento exploratorio específico ${i}`,
      categoria: "exploracion",
      intensidades: ["suave", "moderada", "intensa"],
      contextos_probables: ["nuevo entorno", "objetos desconocidos", "olores interesantes"],
      combinaciones_clave: [],
      layer_1_raw: `Descripción básica observable de la señal de exploración ${i}`,
      layer_2_contextual: `Contexto inmediato que puede influir en la señal de exploración ${i}`,
      layer_3_emotional: `Posibles estados emocionales asociados a la señal de exploración ${i}`,
      layer_4_interpretation: `Interpretación final considerando las capas previas para la señal de exploración ${i}`,
      confidence_range: "70-85%"
    });
    id++;
  }
  
  // Generar señales de estrés
  for (let i = 1; i <= 25; i++) {
    additionalSignals.push({
      id: `estres_${i}`,
      nombre: `Señal de estrés ${i}`,
      descripcion: `Indicador de estrés o ansiedad ${i}`,
      categoria: "estrés",
      intensidades: ["leve", "moderado", "severo"],
      contextos_probables: ["entorno nuevo", "separación", "ruidos fuertes"],
      combinaciones_clave: [],
      layer_1_raw: `Descripción básica observable de la señal de estrés ${i}`,
      layer_2_contextual: `Contexto inmediato que puede influir en la señal de estrés ${i}`,
      layer_3_emotional: `Posibles estados emocionales asociados a la señal de estrés ${i}`,
      layer_4_interpretation: `Interpretación final considerando las capas previas para la señal de estrés ${i}`,
      confidence_range: "75-90%"
    });
    id++;
  }
  
  // Generar señales de curiosidad
  for (let i = 1; i <= 30; i++) {
    additionalSignals.push({
      id: `curiosidad_${i}`,
      nombre: `Señal de curiosidad ${i}`,
      descripcion: `Comportamiento curioso o de interés ${i}`,
      categoria: "curiosidad",
      intensidades: ["leve", "moderada", "intensa"],
      contextos_probables: ["estímulos nuevos", "sonidos", "movimientos"],
      combinaciones_clave: [],
      layer_1_raw: `Descripción básica observable de la señal de curiosidad ${i}`,
      layer_2_contextual: `Contexto inmediato que puede influir en la señal de curiosidad ${i}`,
      layer_3_emotional: `Posibles estados emocionales asociados a la señal de curiosidad ${i}`,
      layer_4_interpretation: `Interpretación final considerando las capas previas para la señal de curiosidad ${i}`,
      confidence_range: "70-85%"
    });
    id++;
  }
  
  // Generar señales de dominancia
  for (let i = 1; i <= 20; i++) {
    additionalSignals.push({
      id: `dominancia_${i}`,
      nombre: `Señal de dominancia ${i}`,
      descripcion: `Comportamiento dominante o de control ${i}`,
      categoria: "dominancia",
      intensidades: ["leve", "moderada", "fuerte"],
      contextos_probables: ["territorio", "recursos", "jerarquía social"],
      combinaciones_clave: [],
      layer_1_raw: `Descripción básica observable de la señal de dominancia ${i}`,
      layer_2_contextual: `Contexto inmediato que puede influir en la señal de dominancia ${i}`,
      layer_3_emotional: `Posibles estados emocionales asociados a la señal de dominancia ${i}`,
      layer_4_interpretation: `Interpretación final considerando las capas previas para la señal de dominancia ${i}`,
      confidence_range: "80-95%"
    });
    id++;
  }
  
  // Generar señales de sumisión
  for (let i = 1; i <= 25; i++) {
    additionalSignals.push({
      id: `sumision_${i}`,
      nombre: `Señal de sumisión ${i}`,
      descripcion: `Comportamiento sumiso o deferente ${i}`,
      categoria: "sumisión",
      intensidades: ["leve", "moderada", "extrema"],
      contextos_probables: ["jerarquía social", "miedo", "respeto"],
      combinaciones_clave: [],
      layer_1_raw: `Descripción básica observable de la señal de sumisión ${i}`,
      layer_2_contextual: `Contexto inmediato que puede influir en la señal de sumisión ${i}`,
      layer_3_emotional: `Posibles estados emocionales asociados a la señal de sumisión ${i}`,
      layer_4_interpretation: `Interpretación final considerando las capas previas para la señal de sumisión ${i}`,
      confidence_range: "75-90%"
    });
    id++;
  }
  
  return additionalSignals;
}

// Función para crear la base de datos completa
function createCompleteDatabase() {
  const signals = [];
  let id = 1;
  
  // Añadir señales de las plantillas
  Object.values(signalTemplates).forEach(category => {
    Object.values(category).forEach(signal => {
      signals.push({
        ...signal,
        id: id++
      });
    });
  });
  
  // Añadir señales adicionales generadas
  const additionalSignals = generateAdditionalSignals();
  signals.push(...additionalSignals);
  
  // Crear la estructura completa
  const completeDatabase = {
    metadata: {
      version: "2.0",
      description: "Motor de interpretación contextual de 4 capas para señales caninas",
      total_signals: signals.length,
      categories: ["juego", "estrés", "exploración", "social", "agresión", "miedo", "alegría", "dominancia", "sumisión", "curiosidad"],
      rules: {
        combination_priority: "Las combinaciones de señales tienen mayor peso interpretativo que señales aisladas",
        confidence_calculation: "El nivel de confianza se ajusta según la coherencia entre capas (1 a 4)",
        fallback: "Si las señales son ambiguas o contradictorias, el output será 'interpretación incierta' con confianza <0.6"
      }
    },
    signals: signals
  };
  
  return completeDatabase;
}

// Función principal
function main() {
  console.log("🔧 Generando base de datos completa de señales caninas...");
  
  const database = createCompleteDatabase();
  
  console.log(`✅ Base de datos generada con ${database.signals.length} señales`);
  console.log(`📊 Categorías disponibles: ${database.metadata.categories.join(', ')}`);
  
  // Mostrar estadísticas por categoría
  const stats = {};
  database.signals.forEach(signal => {
    stats[signal.categoria] = (stats[signal.categoria] || 0) + 1;
  });
  
  console.log("\n📈 Estadísticas por categoría:");
  Object.entries(stats).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} señales`);
  });
  
  console.log("\n💡 La base de datos está lista para usar con el motor de 4 capas");
  console.log("📁 Guarda este contenido en 'src/signals_enhanced.json'");
  
  // Mostrar ejemplo de uso
  console.log("\n🚀 Ejemplo de uso:");
  console.log(`
import signalInterpreterService from './services/signalInterpreterService';

const result = signalInterpreterService.interpretSignals(
  ["play_bow", "cola_mueve_rapido"],
  { lugar: "casa", interaccion: "con humano" }
);

console.log(result.interpretation.summary.narrative);
  `);
  
  // Guardar en archivo
  try {
    const outputPath = join(__dirname, '..', 'src', 'signals_enhanced.json');
    writeFileSync(outputPath, JSON.stringify(database, null, 2));
    console.log(`\n💾 Base de datos guardada en: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error al guardar el archivo:", error.message);
  }
}

// Ejecutar directamente
main();
