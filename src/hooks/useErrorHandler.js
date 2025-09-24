import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error) => {
    console.error('Error capturado:', error);
    setError(error);
  }, []);

  const retry = useCallback(async (retryFunction) => {
    if (!retryFunction) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      await retryFunction();
    } catch (newError) {
      handleError(newError);
    } finally {
      setIsRetrying(false);
    }
  }, [handleError]);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const isQuotaError = useCallback((error) => {
    if (!error) return false;
    const message = error.message || error.toString();
    return message.includes('quota') || message.includes('429');
  }, []);

  const isBlobError = useCallback((error) => {
    if (!error) return false;
    const message = error.message || error.toString();
    return message.includes('blob') && message.includes('ERR_FILE_NOT_FOUND');
  }, []);

  const isNetworkError = useCallback((error) => {
    if (!error) return false;
    const message = error.message || error.toString();
    return message.includes('Failed to fetch') || message.includes('network');
  }, []);

  const getRetryDelay = useCallback((error) => {
    if (!error) return 0;
    const message = error.message || error.toString();
    
    // Extraer tiempo de retry del mensaje de Gemini API
    const match = message.match(/retry in (\d+(?:\.\d+)?)s/);
    return match ? parseFloat(match[1]) * 1000 : 5000; // Convertir a ms, default 5s
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    retry,
    dismissError,
    isQuotaError,
    isBlobError,
    isNetworkError,
    getRetryDelay
  };
};
