import { useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

/**
 * Custom hook for API operations with consistent error handling and loading states
 */
export const useApiOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (config) => {
    const {
      method = 'GET',
      url,
      data = null,
      successMessage = null,
      errorContext = 'API Operation',
      onSuccess = () => {},
      onError = () => {},
    } = config;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance({
        method,
        url,
        data,
      });

      if (successMessage) {
        handleApiSuccess(successMessage);
      }

      const result = response.data;
      onSuccess(result);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = handleApiError(err, errorContext);
      setError(errorMessage);
      onError(err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
};

/**
 * Custom hook for CRUD operations
 */
export const useCrudOperations = (baseUrl, resourceName = 'Resource') => {
  const { loading, error, execute, reset } = useApiOperation();

  const create = useCallback(async (data, options = {}) => {
    return execute({
      method: 'POST',
      url: baseUrl,
      data,
      successMessage: options.successMessage || `${resourceName} created successfully`,
      errorContext: `Create ${resourceName}`,
      ...options,
    });
  }, [execute, baseUrl, resourceName]);

  const read = useCallback(async (id = null, options = {}) => {
    const url = id ? `${baseUrl}/${id}` : baseUrl;
    return execute({
      method: 'GET',
      url,
      errorContext: `Fetch ${resourceName}`,
      ...options,
    });
  }, [execute, baseUrl, resourceName]);

  const update = useCallback(async (id, data, options = {}) => {
    return execute({
      method: 'PUT',
      url: `${baseUrl}/${id}`,
      data,
      successMessage: options.successMessage || `${resourceName} updated successfully`,
      errorContext: `Update ${resourceName}`,
      ...options,
    });
  }, [execute, baseUrl, resourceName]);

  const remove = useCallback(async (id, options = {}) => {
    return execute({
      method: 'DELETE',
      url: `${baseUrl}/${id}`,
      successMessage: options.successMessage || `${resourceName} deleted successfully`,
      errorContext: `Delete ${resourceName}`,
      ...options,
    });
  }, [execute, baseUrl, resourceName]);

  return {
    loading,
    error,
    create,
    read,
    update,
    remove,
    reset,
  };
};

/**
 * Custom hook for dashboard data fetching
 */
export const useDashboardApi = () => {
  const fetchDashboardData = useCrudOperations('/api/v1/dashboard', 'Dashboard Data');
  const budgetOperations = useCrudOperations('/api/v1/dashboard/budgets', 'Budget');
  const goalOperations = useCrudOperations('/api/v1/dashboard/goals', 'Goal');
  const reminderOperations = useCrudOperations('/api/v1/dashboard/reminders', 'Reminder');

  return {
    dashboard: fetchDashboardData,
    budgets: budgetOperations,
    goals: goalOperations,
    reminders: reminderOperations,
  };
};
