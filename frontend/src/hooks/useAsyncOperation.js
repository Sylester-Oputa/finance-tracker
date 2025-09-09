import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states consistently
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (operation, options = {}) => {
    const { 
      onSuccess = () => {}, 
      onError = () => {}, 
      preventReset = false 
    } = options;

    if (!preventReset) {
      setError(null);
    }
    setLoading(true);

    try {
      const result = await operation();
      onSuccess(result);
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      onError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook for managing multiple loading states
 */
export const useMultipleAsyncOperations = (operations = []) => {
  const [loadingStates, setLoadingStates] = useState(
    operations.reduce((acc, operation) => {
      acc[operation] = false;
      return acc;
    }, {})
  );
  
  const [errors, setErrors] = useState({});

  const setLoading = useCallback((operation, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [operation]: isLoading
    }));
  }, []);

  const setError = useCallback((operation, error) => {
    setErrors(prev => ({
      ...prev,
      [operation]: error
    }));
  }, []);

  const clearError = useCallback((operation) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[operation];
      return newErrors;
    });
  }, []);

  const execute = useCallback(async (operationName, operation, options = {}) => {
    const { 
      onSuccess = () => {}, 
      onError = () => {} 
    } = options;

    clearError(operationName);
    setLoading(operationName, true);

    try {
      const result = await operation();
      onSuccess(result);
      return { success: true, data: result };
    } catch (err) {
      setError(operationName, err);
      onError(err);
      return { success: false, error: err };
    } finally {
      setLoading(operationName, false);
    }
  }, [setLoading, setError, clearError]);

  const isLoading = useCallback((operation) => {
    return loadingStates[operation] || false;
  }, [loadingStates]);

  const getError = useCallback((operation) => {
    return errors[operation] || null;
  }, [errors]);

  const isAnyLoading = Object.values(loadingStates).some(loading => loading);

  return {
    loadingStates,
    errors,
    execute,
    isLoading,
    getError,
    isAnyLoading,
    clearError,
  };
};
