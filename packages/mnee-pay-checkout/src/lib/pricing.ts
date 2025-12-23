import { CustomField, CheckoutFormData } from '../types';

/**
 * Calculate the total additional cost from selected custom field options
 */
export function calculateOptionsTotal(
  customFields: CustomField[] | null,
  formData: CheckoutFormData
): number {
  if (!customFields || customFields.length === 0) {
    return 0;
  }

  let total = 0;

  customFields.forEach((field) => {
    // Handle checkbox fields with price modifiers
    if (field.type === 'checkbox') {
      const isChecked = formData.customFields[field.id];
      if (isChecked && field.price) {
        total += field.price;
      }
      return;
    }

    // Handle select and radio fields with options
    if (field.type !== 'select' && field.type !== 'radio') {
      return;
    }

    if (!field.options) {
      return;
    }

    const selectedValue = formData.customFields[field.id];
    if (!selectedValue) {
      return;
    }

    // Find the selected option
    const selectedOption = field.options.find(
      (opt) => opt.value === selectedValue
    );

    if (selectedOption && selectedOption.price) {
      total += selectedOption.price;
    }
  });

  return total;
}

/**
 * Get a map of option field IDs to their individual prices
 */
export function getOptionPrices(
  customFields: CustomField[] | null,
  formData: CheckoutFormData
): Record<string, number> {
  if (!customFields || customFields.length === 0) {
    return {};
  }

  const prices: Record<string, number> = {};

  customFields.forEach((field) => {
    // Handle checkbox fields with price modifiers
    if (field.type === 'checkbox') {
      const isChecked = formData.customFields[field.id];
      if (isChecked && field.price) {
        prices[field.id] = field.price;
      }
      return;
    }

    // Handle select and radio fields with options
    if (field.type !== 'select' && field.type !== 'radio') {
      return;
    }

    if (!field.options) {
      return;
    }

    const selectedValue = formData.customFields[field.id];
    if (!selectedValue) {
      return;
    }

    // Find the selected option
    const selectedOption = field.options.find(
      (opt) => opt.value === selectedValue
    );

    if (selectedOption && selectedOption.price !== undefined) {
      prices[field.id] = selectedOption.price;
    }
  });

  return prices;
}
