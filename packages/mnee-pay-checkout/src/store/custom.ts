import { useStore } from '.';
import { CheckoutType, CustomField, StyleConfig } from '../types';

import { useShallow } from "zustand/react/shallow";

export const useConfigCustomFields: () => (CustomField[] | null) = () => {
  return useStore(useShallow((state) => {
    const { buttonConfig } = state.config;
      if (!buttonConfig?.customFields) {
        return null;
      }

      return buttonConfig.customFields?.map(field => ({
        id: field.id,
        type: field.type as any,
        label: field.label,
        placeholder: field.placeholder,
        defaultValue: field.defaultValue,
        validation: field.required ? { required: true } : undefined,
        options: field.options?.map(opt => ({
          label: opt.label,
          value: opt.value,
          price: opt.priceModifierCents ? opt.priceModifierCents / 100 : undefined,
        })),
      }));
  }));
}

export const useConfigCheckoutType: () => CheckoutType = () => {
  return useStore(useShallow((state) => {
    const { buttonConfig } = state.config;

    if (!buttonConfig) {
      return 'paywall';
    }

    switch (buttonConfig.buttonType) {
      case 'DONATION': return 'donation';
      case 'ECOMMERCE': return 'ecommerce';
      case 'PAYWALL':
      default: return 'paywall';
    }
  }))
};

export const useConfigProduct = () => {
  return useStore(useShallow((state) => {
    const { buttonConfig } = state.config;
    if (!buttonConfig) {
      return null;
    }

    return {
      externalId: buttonConfig.id,
      name: buttonConfig.productName || buttonConfig.name,
      description: buttonConfig.description,
      priceUsdCents: buttonConfig.priceUsdCents || 0,
    };
  }));
}

export const useConfigStyling: () => (StyleConfig | undefined) = () => {
  return useStore(useShallow((state) => {
    const { buttonConfig, styling } = state.config;
    if (!buttonConfig) {
      return styling || undefined;
    }
  
    return {
      ...styling,
      primaryColor: styling?.primaryColor || buttonConfig.primaryColor,
      buttonColor: styling?.buttonColor || buttonConfig.buttonColor,
      buttonTextColor: styling?.buttonTextColor || buttonConfig.buttonTextColor,
      borderRadius: styling?.borderRadius || buttonConfig.borderRadius as any,
      buttonSize: styling?.buttonSize || buttonConfig.buttonSize as any,
      fontFamily: styling?.fontFamily || buttonConfig.fontFamily,
      customCSS: styling?.customCSS || buttonConfig.customCSS,
      accentColor: styling?.accentColor || buttonConfig.accentColor,
    };
  }));

}