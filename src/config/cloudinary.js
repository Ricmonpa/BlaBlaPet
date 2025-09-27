import { v2 as cloudinary } from 'cloudinary';

// Función para configurar Cloudinary
const configureCloudinary = () => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;
  
  console.log('🔧 Configurando Cloudinary con:');
  console.log('Cloud Name:', cloudName);
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'No encontrado');
  console.log('API Secret:', apiSecret ? `${apiSecret.substring(0, 8)}...` : 'No encontrado');
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
};

// Configurar inmediatamente
configureCloudinary();

export default cloudinary;

// Función helper para subir videos a Cloudinary
export const uploadVideoToCloudinary = async (fileBuffer, options = {}) => {
  try {
    // Reconfigurar Cloudinary en cada llamada para asegurar que las variables estén disponibles
    configureCloudinary();
    
    console.log('📤 Iniciando upload a Cloudinary...');
    console.log('📊 Buffer size:', fileBuffer.length, 'bytes');
    console.log('🔧 Opciones:', options);
    
    // Validar que el buffer sea válido
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('File buffer is empty or invalid');
    }
    
    // Crear base64 string con formato correcto
    const base64String = fileBuffer.toString('base64');
    console.log('✅ Base64 generado, longitud:', base64String.length);
    
    // Configurar opciones de upload optimizadas para videos CON WATERMARK AUTOMÁTICO
    const uploadOptions = {
      resource_type: 'video',
      folder: 'yo-pett-videos',
      public_id: `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      chunk_size: 6000000, // 6MB chunks para videos largos
      timeout: 300000, // 5 minutos timeout
      use_filename: true,
      unique_filename: true,
      // 🏷️ WATERMARK AUTOMÁTICO - Logo de Yo Pett en todos los videos
      transformation: [
        {
          overlay: 'yo-pett-logo', // Nombre del logo subido en Cloudinary
          gravity: 'south_east',   // Posición: esquina inferior derecha
          width: 120,              // Tamaño del logo (ajustable)
          height: 120,
          opacity: 30,             // Transparencia 30% (ajustable)
          crop: 'scale'            // Escalar proporcionalmente
        }
      ],
      eager: [
        { 
          width: 320, 
          height: 240, 
          crop: 'scale',
          overlay: 'yo-pett-logo',
          gravity: 'south_east',
          width: 60,
          height: 60,
          opacity: 30,
          crop: 'scale'
        }, // Thumbnail pequeño CON watermark
        { 
          width: 640, 
          height: 480, 
          crop: 'scale',
          overlay: 'yo-pett-logo',
          gravity: 'south_east',
          width: 80,
          height: 80,
          opacity: 30,
          crop: 'scale'
        }  // Thumbnail mediano CON watermark
      ],
      eager_async: true,
      eager_transformation: [
        { 
          quality: 'auto', // Calidad automática
          format: 'mp4',   // Forzar formato MP4
          overlay: 'yo-pett-logo',
          gravity: 'south_east',
          width: 100,
          height: 100,
          opacity: 30,
          crop: 'scale'
        }
      ],
      ...options
    };
    
    console.log('🚀 Enviando a Cloudinary con opciones:', uploadOptions);
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:video/mp4;base64,${base64String}`,
      uploadOptions
    );

    console.log('✅ Upload exitoso a Cloudinary');
    console.log('🔗 URL:', uploadResult.secure_url);
    console.log('🆔 Public ID:', uploadResult.public_id);

    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      assetId: uploadResult.asset_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
      bytes: uploadResult.bytes,
      eager: uploadResult.eager // Thumbnails generados
    };
  } catch (error) {
    console.error('❌ Error detallado en upload a Cloudinary:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      details: error
    });
    
    // Proporcionar mensajes de error más específicos
    if (error.http_code === 400) {
      throw new Error(`Invalid video format or corrupted file: ${error.message}`);
    } else if (error.http_code === 401) {
      throw new Error('Invalid Cloudinary credentials');
    } else if (error.http_code === 413) {
      throw new Error('Video file too large for upload');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Upload timeout - video might be too large');
    } else {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
};

// Función para eliminar video de Cloudinary
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Función para generar URL de video con transformaciones
export const getCloudinaryVideoUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    ...transformations
  });
};

// Función para generar thumbnail
export const getCloudinaryThumbnailUrl = (publicId, width = 320, height = 240) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    width,
    height,
    crop: 'scale',
    format: 'jpg',
    quality: 'auto'
  });
};

// 🏷️ Función para generar URL de video CON WATERMARK automático
export const getCloudinaryVideoUrlWithWatermark = (publicId, transformations = {}) => {
  const defaultWatermarkTransformations = {
    overlay: 'yo-pett-logo',
    gravity: 'south_east',
    width: 120,
    height: 120,
    opacity: 30,
    crop: 'scale'
  };
  
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [defaultWatermarkTransformations, transformations]
  });
};

// 🏷️ Función para generar thumbnail CON WATERMARK
export const getCloudinaryThumbnailUrlWithWatermark = (publicId, width = 320, height = 240) => {
  const watermarkSize = Math.min(width * 0.2, 80); // 20% del ancho o máximo 80px
  
  return cloudinary.url(publicId, {
    resource_type: 'video',
    width,
    height,
    crop: 'scale',
    format: 'jpg',
    quality: 'auto',
    overlay: 'yo-pett-logo',
    gravity: 'south_east',
    width: watermarkSize,
    height: watermarkSize,
    opacity: 30,
    crop: 'scale'
  });
};
