import { useState, useCallback } from 'react';
import { validateEmail } from '../utils/helper';

/**
 * Custom hook for form validation
 */
export const useFormValidation = (validationRules = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((field, value, rules = validationRules[field]) => {
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, [validationRules]);

  const validateForm = useCallback((formData) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField, validationRules]);

  const setFieldTouched = useCallback((field, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback((field) => {
    return touched[field] ? errors[field] : null;
  }, [errors, touched]);

  const hasErrors = Object.keys(errors).length > 0;
  const isFieldValid = useCallback((field) => {
    return touched[field] && !errors[field];
  }, [errors, touched]);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    resetValidation,
    getFieldError,
    hasErrors,
    isFieldValid,
  };
};

/**
 * Validation rules factory
 */
export const createValidationRules = {
  required: (message = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },

  email: (message = 'Please enter a valid email address') => (value) => {
    if (value && !validateEmail(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return null;
  },

  positiveNumber: (message = 'Must be a positive number') => (value) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num <= 0)) {
      return message;
    }
    return null;
  },

  custom: (validator, message) => (value) => {
    if (!validator(value)) {
      return message;
    }
    return null;
  },
};

/**
 * Common validation rule sets
 */
export const commonValidationRules = {
  email: [
    createValidationRules.required(),
    createValidationRules.email(),
  ],
  
  password: [
    createValidationRules.required(),
    createValidationRules.minLength(6, 'Password must be at least 6 characters'),
  ],
  
  name: [
    createValidationRules.required(),
    createValidationRules.minLength(2, 'Name must be at least 2 characters'),
  ],
  
  amount: [
    createValidationRules.required(),
    createValidationRules.positiveNumber(),
  ],
  
  category: [
    createValidationRules.required(),
  ],
};
