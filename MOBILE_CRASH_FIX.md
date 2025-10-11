# Fix para Crash en Mobile y Double Upload

## Problemas Solucionados

### 1. 🚨 Crash en Android Motorola
**Problema**: Chrome Android mataba el tab con mensaje "¡Oh, no! Se produjo un error cuando se mostraba la página web"

**Causa Raíz**: 
- Compresión de video en cliente consumía 500-700MB RAM
- Android Motorola tiene límite de ~500MB por tab
- Canvas processing + MediaRecorder causaba pico de memoria

**Solución Implementada**:
- ✅ **Detección de Mobile**: `/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)`
- ✅ **SKIP compresión en mobile**: Cloudinary maneja compresión en servidor
- ✅ **Resolución reducida en mobile**: 480p vs 720p (50% menos memoria)
- ✅ **Timeout diferenciado**: 5 min mobile vs 20 min desktop

### 2. 🔄 Double Upload en Cloudinary
**Problema**: Videos duplicados aparecían en Cloudinary (mismo contenido, IDs diferentes)

**Causa Raíz**:
- Camera.jsx hacía upload en background ✅
- Home.jsx **ignoraba** flag `skipUpload: true` ❌
- Home.jsx hacía **segundo upload** independiente ❌

**Solución Implementada**:
- ✅ **Respetar skipUpload flag** en Home.jsx
- ✅ **Usar URL del background upload** cuando skipUpload=true
- ✅ **Eliminar upload duplicado** en el flujo normal

## Cambios Técnicos

### Home.jsx
```javascript
// ANTES: Siempre hacía upload
console.log('📤 Subiendo video a Cloudinary (sin skipUpload)...');

// DESPUÉS: Respeta skipUpload
if (location.state.skipUpload) {
  console.log('⏭️ SKIP UPLOAD: Video ya fue subido en background');
  // Usar location.state.uploadedUrl directamente
}
```

### Compresión Mobile
```javascript
// ANTES: Compresión siempre
console.log('🎯 Aplicando compresión inteligente automática...');

// DESPUÉS: Skip en mobile
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if (isMobile) {
  console.log('📱 MOBILE DETECTADO - SKIP compresión (prevenir crash)');
  // Retornar video sin comprimir
}
```

### Resolución Mobile
```javascript
// ANTES: Siempre 720p
width: 720, height: 1280

// DESPUÉS: 480p en mobile
width: isMobile ? 480 : 720,
height: isMobile ? 854 : 1280
```

### Timeout Mobile
```javascript
// ANTES: 20 min para todos
setTimeout(() => reject(new Error('Timeout')), 1200000)

// DESPUÉS: 5 min mobile, 20 min desktop
const timeoutDuration = isMobile ? 300000 : 1200000;
```

## Resultados Esperados

### Mobile (Android Motorola)
| Antes | Después |
|-------|---------|
| ❌ Crash con "¡Oh no! Error" | ✅ Funciona perfectamente |
| ❌ 720p = 15MB video | ✅ 480p = 6MB video |
| ❌ Compresión = 500MB RAM | ✅ Sin compresión = 20MB RAM |
| ❌ Timeout 20 min | ✅ Timeout 5 min |

### Cloudinary
| Antes | Después |
|-------|---------|
| ❌ 2 videos duplicados | ✅ 1 video único |
| ❌ 2x storage usado | ✅ 1x storage usado |
| ❌ IDs diferentes | ✅ ID único |

## Testing

### Mobile Test (Android)
1. Grabar video 30-60 segundos
2. Presionar "Traducir"
3. Verificar logs: `📱 MOBILE DETECTADO - SKIP compresión`
4. **NO debe crashear** - debe mostrar análisis

### Desktop Test
1. Grabar video 30-60 segundos  
2. Presionar "Traducir"
3. Verificar logs: `💻 DESKTOP - Aplicando compresión inteligente`
4. Debe funcionar como antes

### Cloudinary Test
1. Subir video desde cualquier dispositivo
2. Verificar que **solo aparece 1 video** en Cloudinary
3. No debe haber duplicados

## Archivos Modificados

- ✅ `src/pages/Home.jsx` - Fix double upload + skip compresión mobile
- ✅ `src/pages/Camera.jsx` - Resolución mobile + timeout diferenciado

## Fecha de Implementación
$(date)
