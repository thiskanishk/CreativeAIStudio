import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: T, formData?: Record<string, any>) => string | null;

interface ValidationRules<T> {
  [key: string]: ValidationRule<T>[];
}

/**
 * A custom hook for handling form validation
 * 
 * @param initialData The initial form data
 * @param validationRules The validation rules for each field
 * @returns Form validation utilities
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRules<any>
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isDirty, setIsDirty] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: string, value: any, allFormData?: T): string | null => {
    if (!validationRules[field]) return null;
    
    for (const rule of validationRules[field]) {
      const error = rule(value, allFormData || formData);
      if (error) return error;
    }
    
    return null;
  }, [formData, validationRules]);

  // Validate all fields in the form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    // Run validation on all fields with rules
    Object.keys(validationRules).forEach(field => {
      const fieldValue = formData[field];
      const error = validateField(field, fieldValue, formData);
      
      newErrors[field] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField, validationRules]);

  // Handle field change
  const handleChange = useCallback((fieldName: string, value: any) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Mark field as dirty
    setIsDirty(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // If the form has been submitted, validate the field immediately
    if (isSubmitted) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: validateField(fieldName, value)
      }));
    }
  }, [isSubmitted, validateField]);

  // Handle form submission
  const handleSubmit = useCallback((onValid: (data: T) => void) => {
    return (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      setIsSubmitted(true);
      const isValid = validateForm();

      if (isValid) {
        onValid(formData);
      }
    };
  }, [formData, validateForm]);

  // Reset form to initial values
  const resetForm = useCallback((newInitialData?: T) => {
    setFormData(newInitialData || initialData);
    setErrors({});
    setIsDirty({});
    setIsSubmitted(false);
  }, [initialData]);

  // Get field props
  const getFieldProps = useCallback((fieldName: string) => {
    return {
      value: formData[fieldName],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(fieldName, e.target.value),
      onBlur: () => {
        // Validate on blur if the field is dirty
        if (isDirty[fieldName] || isSubmitted) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: validateField(fieldName, formData[fieldName])
          }));
        }
      },
      error: !!errors[fieldName],
      helperText: errors[fieldName]
    };
  }, [formData, handleChange, errors, isDirty, isSubmitted, validateField]);

  return {
    formData,
    setFormData,
    errors,
    isDirty,
    isSubmitted,
    validateField,
    validateForm,
    handleChange,
    handleSubmit,
    resetForm,
    getFieldProps
  };
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required') => 
    (value: any) => {
      if (value === undefined || value === null || value === '') {
        return message;
      }
      return null;
    },
  
  minLength: (min: number, message = `Minimum length is ${min} characters`) => 
    (value: string) => {
      if (!value || value.length < min) {
        return message;
      }
      return null;
    },
  
  maxLength: (max: number, message = `Maximum length is ${max} characters`) => 
    (value: string) => {
      if (value && value.length > max) {
        return message;
      }
      return null;
    },
  
  email: (message = 'Please enter a valid email address') => 
    (value: string) => {
      if (!value) return null;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value) ? null : message;
    },
  
  url: (message = 'Please enter a valid URL') => 
    (value: string) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch (e) {
        return message;
      }
    },
  
  match: (fieldToMatch: string, message = 'Fields do not match') => 
    (value: any, formData?: Record<string, any>) => {
      if (!formData) return null;
      return value === formData[fieldToMatch] ? null : message;
    }
};

export default useFormValidation; 