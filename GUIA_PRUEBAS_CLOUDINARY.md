# 🧪 Guía de Pruebas - Cloudinary Upload

## ✅ Estado Actual
- ✅ Cloudinary configurado y funcionando
- ✅ Frontend migrado a Cloudinary
- ✅ Variables de entorno correctas
- ✅ Sin errores de linting

## 🚀 Para hacer pruebas de upload:

### **Opción 1: Prueba Automática**
```bash
# 1. Asegúrate de que el servidor esté corriendo
npm run dev

# 2. En otra terminal, ejecuta la prueba
npm run test:upload
```

### **Opción 2: Prueba Manual (Recomendada)**

#### **Paso 1: Iniciar el servidor**
```bash
npm run dev
```
Espera a que veas: `Local: http://localhost:5173/`

#### **Paso 2: Abrir la aplicación**
1. Ve a `http://localhost:5173`
2. Haz clic en el ícono de la cámara (bottom navigation)
3. Graba un video corto (10-30 segundos)
4. Completa el análisis de IA
5. El video se subirá automáticamente a Cloudinary

#### **Paso 3: Verificar el upload**
- Revisa la consola del navegador (F12)
- Deberías ver mensajes como:
  ```
  🚀 Subiendo archivo directamente a Cloudinary...
  ✅ Upload a Cloudinary exitoso
  🔗 URL del video subido: https://res.cloudinary.com/...
  ```

#### **Paso 4: Verificar en Cloudinary**
1. Ve a tu dashboard de Cloudinary
2. Busca el video recién subido
3. Verifica que tenga thumbnails generados automáticamente

## 🔍 Verificaciones Importantes

### **1. Variables de Entorno**
```bash
# Verificar que estén configuradas
echo $REACT_APP_CLOUDINARY_CLOUD_NAME
echo $REACT_APP_CLOUDINARY_API_KEY
echo $REACT_APP_CLOUDINARY_API_SECRET
```

### **2. Endpoint de Cloudinary**
- URL: `http://localhost:5173/api/upload-video-cloudinary`
- Método: POST
- Content-Type: multipart/form-data

### **3. Respuesta Esperada**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/dew2lpfcb/video/upload/...",
  "publicId": "yo-pett-videos/video_1234567890_abc123",
  "metadata": {
    "id": "video_1234567890_abc123",
    "petName": "Tu Mascota",
    "translation": "Análisis completado",
    "mediaUrl": "https://res.cloudinary.com/...",
    "cloudinary": {
      "publicId": "yo-pett-videos/video_1234567890_abc123",
      "duration": 15.5,
      "format": "mp4"
    }
  }
}
```

## 🐛 Solución de Problemas

### **Error: "Cloudinary configuration is missing"**
```bash
# Verificar variables en .env
cat .env | grep CLOUDINARY
```

### **Error: "Request Timeout"**
- Normal para videos grandes (>50MB)
- Prueba con videos más pequeños (10-30 segundos)

### **Error: "Method not allowed"**
- Verificar que el endpoint esté en `/api/upload-video-cloudinary`
- Verificar que el método sea POST

### **Error: "No video file provided"**
- Verificar que el FormData incluya el campo 'video'
- Verificar que el archivo sea válido

## 📊 Ventajas de Cloudinary vs Vercel Blob

| Característica | Vercel Blob | Cloudinary |
|----------------|-------------|------------|
| Tamaño máximo | 20MB | 100MB |
| Thumbnails | Manual | Automático |
| Transformaciones | No | Sí |
| CDN | Básico | Global |
| Análisis de video | No | Sí |

## 🎯 Próximos Pasos

1. **Probar con videos reales** usando la cámara
2. **Verificar thumbnails** generados automáticamente
3. **Probar transformaciones** de video
4. **Optimizar compresión** si es necesario

## 🆘 Si algo no funciona

1. **Revisa la consola** del navegador (F12)
2. **Revisa la consola** del servidor (terminal)
3. **Verifica las variables** de entorno
4. **Ejecuta las pruebas** automáticas:
   ```bash
   npm run test:cloudinary
   npm run test:upload
   ```

¡Listo para hacer pruebas! 🚀
