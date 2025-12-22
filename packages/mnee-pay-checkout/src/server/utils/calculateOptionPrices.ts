/**
 * Calculate total price from selected custom field options
 *
 * Handles select, radio, and checkbox fields with price modifiers.
 * Used for product variants (e.g., "XL" size adds $2, "Premium" option adds $5)
 */

export interface CustomFieldOption {
  label: string;
  value: string;
  price?: number;
}

export interface CustomField {
  id: string;
  type: 'select' | 'radio' | 'checkbox' | 'text' | 'textarea';
  options?: CustomFieldOption[];
  price?: number;
}

export function calculateOptionPrices(
  customFields: CustomField[],
  selectedOptions: Record<string, any>
): number {
  if (!customFields || !selectedOptions) {
    return 0;
  }

  let optionsTotal = 0;

  for (const field of customFields) {
    const selectedValue = selectedOptions[field.id];
    if (!selectedValue) continue;

    // For select/radio fields with options
    if (field.options) {
      const selectedOption = field.options.find(
        (opt) => opt.value === selectedValue
      );
      if (selectedOption?.price) {
        optionsTotal += selectedOption.price;
      }
    }

    // For checkbox fields with price
    if (field.type === 'checkbox' && selectedValue === true && field.price) {
      optionsTotal += field.price;
    }
  }

  return optionsTotal;
}
