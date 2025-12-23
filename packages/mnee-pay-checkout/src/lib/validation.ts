import { CustomField, CheckoutFormData, ShippingAddress } from '../types';

/**
 * Validates a single field value against its validation rules
 */
export function validateField(field: CustomField, value: any): string | null {
  // Check required
  if (field.validation?.required) {
    if (value === undefined || value === null || value === '') {
      return `${field.label} is required`;
    }
  }

  // Skip further validation if field is empty and not required
  if (!value && !field.validation?.required) {
    return null;
  }

  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
  }

  // Min length validation
  if (field.validation?.minLength && typeof value === 'string') {
    if (value.length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters`;
    }
  }

  // Max length validation
  if (field.validation?.maxLength && typeof value === 'string') {
    if (value.length > field.validation.maxLength) {
      return `${field.label} must be no more than ${field.validation.maxLength} characters`;
    }
  }

  // Pattern validation
  if (field.validation?.pattern && typeof value === 'string') {
    const regex = new RegExp(field.validation.pattern);
    if (!regex.test(value)) {
      return field.validation.message || `${field.label} is invalid`;
    }
  }

  // Custom validation
  if (field.validation?.custom && typeof field.validation.custom === 'function') {
    const result = field.validation.custom(value);
    if (typeof result === 'string') {
      return result;
    }
  }

  return null;
}

/**
 * Validates all fields and returns errors object
 */
export function validateFields(
  fields: CustomField[],
  formData: CheckoutFormData
): Record<string, string> {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    // Check if field should be shown based on dependencies
    if (field.dependsOn) {
      const dependentValue = formData.customFields[field.dependsOn.fieldId];
      if (dependentValue !== field.dependsOn.value) {
        return; // Skip validation for hidden fields
      }
    }

    const value = formData.customFields[field.id] ?? field.defaultValue;
    const error = validateField(field, value);

    if (error) {
      errors[field.id] = error;
    }
  });

  return errors;
}

/**
 * Validates email field specifically
 */
export function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
}

/**
 * Validates shipping address
 */
export function validateShippingAddress(shipping?: ShippingAddress): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!shipping) {
    return {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      address1: 'Street address is required',
      city: 'City is required',
      state: 'State/Province is required',
      postalCode: 'Postal code is required',
      country: 'Country is required',
    };
  }

  const requiredFields = [
    { key: 'firstName' as const, label: 'First name' },
    { key: 'lastName' as const, label: 'Last name' },
    { key: 'address1' as const, label: 'Street address' },
    { key: 'city' as const, label: 'City' },
    { key: 'state' as const, label: 'State/Province' },
    { key: 'postalCode' as const, label: 'Postal code' },
    { key: 'country' as const, label: 'Country' },
  ];

  requiredFields.forEach(({ key, label }) => {
    const value = shipping[key];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[key] = `${label} is required`;
    }
  });

  return errors;
}
