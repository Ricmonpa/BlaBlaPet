# 🧠 Arquitectura del Cerebro IA - Gemini

## Descripción General

El "cerebro IA" de Yo Pett utiliza Google Gemini 1.5 Flash para analizar imágenes y videos de perros, interpretando su comportamiento y generando traducciones divertidas y empáticas.

## Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   GeminiService  │    │   Gemini 1.5    │
│   (React)       │───▶│   (Middleware)   │───▶│   Flash API     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Translator    │    │   Media          │    │   Response      │
│   Service       │    │   Processing     │    │   Parser        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Componentes Principales

### 1. GeminiService (`src/services/geminiService.js`)

**Responsabilidades:**
- Inicialización de la API de Gemini
- Procesamiento de media (imágenes/videos)
- Generación de prompts especializados
- Parseo de respuestas
- Manejo de errores y fallbacks

**Métodos Clave:**
```javascript
// Análisis principal
async analyzePetMedia(mediaData, mediaType)

// Preparación de media
async prepareMediaForGemini(mediaData, mediaType)

// Construcción de prompts
buildPetAnalysisPrompt(mediaType)

// Parseo de respuestas
parseGeminiResponse(text)
```

### 2. TranslatorService (`src/services/translatorService.js`)

**Responsabilidades:**
- Orquestación entre Gemini y API externa
- Fallback a simulación local
- Interfaz unificada para el frontend

**Flujo de Decisión:**
```javascript
if (useGemini && geminiAvailable) {
  return await geminiService.analyzePetMedia()
} else if (externalApiAvailable) {
  return await externalApiCall()
} else {
  return simulateTranslation()
}
```

## Prompt Engineering

### Prompt Base para Análisis Canino

```javascript
`Eres un experto en comportamiento animal y comunicación canina. Analiza esta ${mediaType} de un perro y proporciona:

1. **Traducción**: ¿Qué está "diciendo" el perro? Sé divertido, cálido y empático.
2. **Confianza**: Del 1 al 100, qué tan segura estás de tu interpretación.
3. **Emoción detectada**: La emoción principal del perro.
4. **Comportamiento observado**: Qué gestos, posturas o acciones específicas observas.
5. **Contexto sugerido**: Qué podría estar pasando alrededor del perro.

Responde en formato JSON:
{
  "translation": "traducción divertida",
  "confidence": 85,
  "emotion": "feliz",
  "behavior": "moviendo la cola rápidamente",
  "context": "probablemente ve a su dueño"
}`
```

### Optimizaciones del Prompt

1. **Especificidad**: Instrucciones claras sobre el formato de respuesta
2. **Tono**: Enfoque en ser divertido y empático
3. **Estructura**: Formato JSON para facilitar el parseo
4. **Contexto**: Solicitud de información adicional útil

## Procesamiento de Media

### Imágenes
- **Formato**: Base64 o Blob
- **Procesamiento**: Conversión directa a formato compatible con Gemini
- **Optimización**: Compresión JPEG para reducir tamaño

### Videos
- **Formato**: MP4, WebM
- **Procesamiento**: Extracción de thumbnail en el 25% del video
- **Técnica**: Canvas API para capturar frame específico
- **Optimización**: Resolución reducida para análisis más rápido

```javascript
// Creación de thumbnail de video
async createVideoThumbnail(videoBlob) {
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  
  video.currentTime = video.duration * 0.25; // Frame al 25%
  ctx.drawImage(video, 0, 0);
  
  return canvas.toDataURL('image/jpeg', 0.8);
}
```

## Manejo de Respuestas

### Estructura de Respuesta

```javascript
{
  translation: "¡Hola humano! Estoy muy feliz de verte",
  confidence: 85,
  emotion: "feliz",
  behavior: "moviendo la cola rápidamente",
  context: "probablemente ve a su dueño",
  success: true,
  source: "gemini"
}
```

### Parseo Robusto

1. **Extracción JSON**: Regex para encontrar JSON en la respuesta
2. **Fallback**: Uso del texto completo si no hay JSON válido
3. **Validación**: Verificación de campos requeridos
4. **Normalización**: Valores por defecto para campos faltantes

## Manejo de Errores

### Estrategias de Fallback

1. **Gemini no disponible**: Fallback a API externa
2. **API externa no disponible**: Simulación local
3. **Error de parseo**: Respuesta genérica con confianza baja
4. **Error de red**: Timeout y reintentos

### Respuestas de Fallback

```javascript
const fallbackTranslations = [
  "¡Hola! Soy un perro muy especial y tengo mucho que decirte!",
  "Mmm... creo que necesito más tiempo para pensar en mi respuesta",
  "¡Woof! Estoy aquí y listo para comunicarme contigo"
];
```

## Configuración y Variables de Entorno

### Variables Requeridas

```bash
# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# External API Configuration (fallback)
REACT_APP_TRANSLATOR_API_URL=http://localhost:3001/api
```

### Configuración del Modelo

```javascript
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash"  // Modelo optimizado para velocidad
});
```

## Métricas y Monitoreo

### Métricas Clave

1. **Tiempo de Respuesta**: < 3 segundos para análisis
2. **Tasa de Éxito**: > 95% de análisis exitosos
3. **Confianza Promedio**: > 70% de confianza
4. **Fallback Rate**: < 5% de uso de fallbacks

### Logging

```javascript
console.log('🔍 Analizando media con Gemini...');
console.log('✅ Análisis completado:', analysis);
console.error('❌ Error en análisis Gemini:', error);
```

## Optimizaciones Futuras

### Mejoras Planificadas

1. **Caching**: Cache de análisis similares
2. **Batch Processing**: Análisis múltiple de frames de video
3. **Custom Model**: Fine-tuning específico para comportamiento canino
4. **Real-time**: Análisis en tiempo real durante grabación

### Escalabilidad

1. **Rate Limiting**: Control de requests por usuario
2. **Queue System**: Cola para procesamiento asíncrono
3. **CDN**: Distribución de carga para media
4. **Microservices**: Separación de responsabilidades

## Pruebas y Validación

### Casos de Prueba

1. **Imágenes claras**: Perro mirando a la cámara
2. **Videos cortos**: 5-10 segundos de acción específica
3. **Diferentes razas**: Variedad de tipos de perros
4. **Condiciones de luz**: Diferentes niveles de iluminación
5. **Ángulos**: Diferentes perspectivas del perro

### Validación de Calidad

1. **Relevancia**: La traducción debe ser coherente con la imagen
2. **Tono**: Mantener tono divertido y empático
3. **Confianza**: Valores realistas de confianza
4. **Completitud**: Todos los campos requeridos presentes

## Seguridad y Privacidad

### Consideraciones

1. **API Key**: Nunca exponer en frontend (usar variables de entorno)
2. **Media**: No almacenar permanentemente
3. **Logs**: No registrar contenido sensible
4. **Rate Limiting**: Prevenir abuso del servicio

### Compliance

1. **GDPR**: Manejo de datos personales
2. **COPPA**: Protección de menores
3. **Términos de Servicio**: Cumplimiento con Google AI
4. **Privacidad**: Política clara de uso de datos
