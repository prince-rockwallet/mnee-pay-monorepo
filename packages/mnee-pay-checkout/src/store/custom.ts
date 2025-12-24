import { useMemo } from 'react';
import { useStore } from '.';
import { CheckoutType, CustomField, StyleConfig } from '../types';

import { useShallow } from "zustand/react/shallow";

export const useConfigCustomFields: () => (CustomField[] | null) = () => {
  const customFields = useStore(useShallow((state) => {
    return state.config?.buttonConfig?.customFields || [];
  }));

  return useMemo(() => {
    return customFields?.map(field => ({
      id: field.id,
      type: field.type,
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
  }, [customFields]);
}

export const useConfigCheckoutType: () => CheckoutType = () => {
  const buttonType = useStore(useShallow((state) => {
    return state.config?.buttonConfig?.buttonType || 'PAYWALL';
  }));

  return useMemo(() => {
    switch (buttonType) {
      case 'DONATION': return 'donation';
      case 'ECOMMERCE': return 'ecommerce';
      case 'PAYWALL':
      default: return 'paywall';
    }
  }, [buttonType])
};

export const useConfigProduct = () => {
  const buttonConfig = useStore(useShallow((state) => {
    return state.config?.buttonConfig;
  }));

  return useMemo(() => {
    if (!buttonConfig) {
      return null;
    }

    return {
      externalId: buttonConfig.id,
      name: buttonConfig.productName || buttonConfig.name,
      description: buttonConfig.description,
      priceUsdCents: buttonConfig.priceUsdCents || 0,
    };
  }, [buttonConfig]);
}

export const useConfigStyling: () => (StyleConfig | undefined) = () => {
  const { buttonConfig, styling } = useStore(useShallow((state) => {
    return {
      buttonConfig: state.config.buttonConfig,
      styling: state.config.styling,
    }
  }));

  return useMemo(() => {
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
  }, [buttonConfig, styling]);

}