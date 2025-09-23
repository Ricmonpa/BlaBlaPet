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
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:video/mp4;base64,${fileBuffer.toString('base64')}`,
      {
        resource_type: 'video',
        folder: 'yo-pett-videos',
        public_id: `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        chunk_size: 6000000, // 6MB chunks para videos largos
        eager: [
          { width: 320, height: 240, crop: 'scale' }, // Thumbnail pequeño
          { width: 640, height: 480, crop: 'scale' }  // Thumbnail mediano
        ],
        eager_async: true,
        ...options
      }
    );

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
    console.error('Error uploading to Cloudinary:', error);
    throw error;
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
