import { useState, useCallback } from 'react';

// Validation rules
const validationRules = {
  required: (value, message = 'This field is required') => {
    return !value || !value.trim() ? message : null;
  },
  
  email: (value, message = 'Invalid email address') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : null;
  },
  
  minLength: (length, message) => (value) => {
    return value && value.length < length ? message || `Must be at least ${length} characters` : null;
  },
  
  match: (matchValue, message = 'Values do not match') => (value) => {
    return value !== matchValue ? message : null;
  },
  
  custom: (validatorFn, message) => (value) => {
    return !validatorFn(value) ? message : null;
  }
};

export const useValidation = (initialData = {}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const updateField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validate = useCallback((field, rules) => {
    const value = data[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        return error;
      }
    }
    return null;
  }, [data]);

  const validateField = useCallback((field, rules) => {
    const error = validate(field, rules);
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [validate]);

  const validateAll = useCallback((fieldRules) => {
    setIsValidating(true);
    const newErrors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(fieldRules)) {
      const error = validate(field, rules);
      newErrors[field] = error;
      if (error) {
        isValid = false;
      }
    }

    setErrors(newErrors);
    setIsValidating(false);
    return isValid;
  }, [validate]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsValidating(false);
  }, [initialData]);

  const hasErrors = Object.values(errors).some(error => error !== null);

  return {
    data,
    errors,
    isValidating,
    hasErrors,
    updateField,
    validateField,
    validateAll,
    clearErrors,
    resetForm,
    rules: validationRules
  };
};