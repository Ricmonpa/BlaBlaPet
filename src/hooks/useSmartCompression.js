import { useState, useCallback } from 'react';
import SmartVideoCompressor from '../utils/smartVideoCompressor.js';

/**
 * Hook para manejar compresión inteligente de video con progreso
 */
export const useSmartCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProfile, setCurrentProfile] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState(null);

  const compressVideo = useCallback(async (videoFile) => {
    if (!videoFile) {
      throw new Error('No se proporcionó archivo de video');
    }

    setIsCompressing(true);
    setProgress(0);
    setError(null);
    setAttempts([]);
    setOriginalSize(videoFile.size / (1024 * 1024));

    try {
      console.log('🎯 Iniciando compresión inteligente...');
      
      // Análisis inicial
      setProgress(10);
      const analysis = await SmartVideoCompressor.analyzeVideo(videoFile);
      
      console.log('📊 Análisis del video:', analysis);
      
      if (!analysis.needsCompression) {
        console.log('✅ Video no necesita compresión');
        setProgress(100);
        setCurrentProfile('none');
        setCompressedSize(originalSize);
        setIsCompressing(false);
        
        return {
          file: videoFile,
          needsCompression: false,
          analysis,
          attempts: [{ profile: 'none', success: true, sizeMB: originalSize }]
        };
      }

      setProgress(20);
      setCurrentProfile('Analizando...');

      // Compresión con fallback
      const result = await SmartVideoCompressor.compressWithFallback(videoFile);
      
      setProgress(90);
      setCurrentProfile(result.finalProfile);
      setCompressedSize(result.file.size / (1024 * 1024));
      setAttempts(result.attempts);
      
      setProgress(100);
      
      console.log('✅ Compresión completada:', {
        perfilFinal: result.finalProfile,
        intentos: result.attempts.length,
        tamañoFinal: (result.file.size / 1024 / 1024).toFixed(2) + ' MB'
      });

      return {
        file: result.file,
        needsCompression: true,
        analysis: result.analysis,
        attempts: result.attempts,
        finalProfile: result.finalProfile
      };

    } catch (error) {
      console.error('❌ Error en compresión:', error);
      setError(error.message);
      setIsCompressing(false);
      throw error;
    } finally {
      setIsCompressing(false);
    }
  }, [originalSize]);

  const reset = useCallback(() => {
    setIsCompressing(false);
    setProgress(0);
    setCurrentProfile('');
    setOriginalSize(0);
    setCompressedSize(0);
    setAttempts([]);
    setError(null);
  }, []);

  return {
    compressVideo,
    isCompressing,
    progress,
    currentProfile,
    originalSize,
    compressedSize,
    attempts,
    error,
    reset
  };
};
