# Yo Pett 🐕

## Descripción del Proyecto
Yo Pett es una aplicación tipo TikTok para dog-parents que permite grabar/subir fotos o videos de perros y obtener "traducciones" divertidas de lo que dice el perro, con porcentaje de probabilidad.

## Características Principales
- 📸 Grabación y subida de fotos/videos de perros
- 🧠 Traducción IA del comportamiento canino
- 🎭 **Doblaje emocional** - Nueva capa de subtítulos más humana
- 📊 Porcentaje de probabilidad de la traducción
- 📱 Feed de contenido tipo TikTok
- 🌐 Soporte multiidioma (ES/EN)
- 📱 Diseño mobile-first
- 🏷️ **Watermark automático** - Logo de Yo Pett en todos los videos (como TikTok)

## Stack Tecnológico
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS v4
- **IA**: Gemini 1.5 Flash (Google AI)
- **Media**: Cloudinary (procesamiento de videos/imágenes + watermark automático)
- **Idiomas**: ES/EN (auto-detección + configuración manual)

## Paleta de Colores
- **Rojo Yoo Pett**: `#db195d` (amable y llamativo)
- **Azul Yoo Pett**: `#1ca9b1` (amigable y moderno)
- **Base**: Negro/Blanco

## Arquitectura
- Diseño modular para escalabilidad
- Preparado para integración con Gemini IA
- Estructura base para portar a iOS/Android

## Funcionamiento IA
El "cerebro IA" interpretará el lenguaje de las mascotas mediante prompts como:
> "Eres un perro que puede comunicarse con humanos. Responde como si tradujeras tus gestos, ladridos y actitudes a lenguaje humano. Mantén un tono divertido, cálido y coherente con la especie."

### Ejemplo de Uso
- **Input**: Video de perro moviendo la cola rápidamente
- **Output**: "¡Estoy feliz de verte! ¿Quieres jugar?" (con subtítulos)

## Desarrollo
1. **Fase 1**: ✅ UI/UX base con "cerebro" simulado
2. **Fase 2**: ✅ Integración con Gemini IA
3. **Fase 2.5**: ✅ **Sistema de Doblaje Emocional** implementado
4. **Fase 2.7**: ✅ **Watermark automático** con Cloudinary implementado
5. **Fase 3**: 🔄 Portabilidad a móviles

### Configuración de Gemini IA
1. Obtener API key de Google AI Studio: https://makersuite.google.com/app/apikey
2. Crear archivo `.env` basado en `env.example`
3. Agregar tu API key: `VITE_GEMINI_API_KEY=tu_api_key_aqui`
4. Ejecutar `npm run dev` para probar la integración

### Configuración de Cloudinary (Watermark)
1. Crear cuenta en Cloudinary: https://cloudinary.com
2. Subir logo de Yo Pett con nombre: `yo-pett-logo`
3. Configurar variables de entorno:
   ```env
   REACT_APP_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   REACT_APP_CLOUDINARY_API_KEY=tu_api_key
   REACT_APP_CLOUDINARY_API_SECRET=tu_api_secret
   ```
4. Ver documentación completa: `docs/WATERMARK_IMPLEMENTATION.md`

## Comandos de Desarrollo
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Estado Actual del Proyecto
✅ **Completado**: Pantalla Home con feed tipo TikTok
✅ **Completado**: Navegación inferior funcional
✅ **Completado**: Overlay de traducción con probabilidad
✅ **Completado**: Diseño mobile-first con Tailwind CSS v4
✅ **Completado**: Integración con Gemini IA (Fase 2)
✅ **Completado**: Servicio de análisis de imágenes/videos
✅ **Completado**: Componente de prueba para Gemini
🔄 **En desarrollo**: Funcionalidad de cámara/galería
🔄 **Pendiente**: Pruebas con videos reales
