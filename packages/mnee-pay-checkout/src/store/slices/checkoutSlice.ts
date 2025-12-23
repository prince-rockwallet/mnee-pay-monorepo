import { StateCreator } from 'zustand';
import { createButtonSession as createButtonSessionAPI } from '../../lib/api';
import { DEFAULT_PAYMENT_METHOD } from '../../constants/payment-methods';
import { CheckoutSliceState, StoreState, CheckoutSlice } from '../types';
import { CheckoutFormData } from '../../types';

const initialFormData: CheckoutFormData = {
  customFields: {},
};

const initialCheckoutState: CheckoutSliceState = {
  step: 'initial',
  formData: initialFormData,
  errors: {},
  selectedPaymentMethod: DEFAULT_PAYMENT_METHOD,
  isCreatingSession: false,
  session: undefined,
  paymentResult: undefined,
};

export const createCheckoutSlice: StateCreator<
  StoreState,
  [["zustand/immer", never], ["zustand/devtools", never]],
  [],
  CheckoutSlice
> = (set, get) => ({
  checkout: initialCheckoutState,

  checkoutActions: {
    updateFormData: (data) => {
      set((state) => {
        state.checkout.formData = {
          ...state.checkout.formData,
          ...data,
          customFields: {
            ...state.checkout.formData.customFields,
            ...(data.customFields || {}),
          },
        };
      });
    },

    setErrors: (errors) => {
      set((state) => {
        state.checkout.errors = errors;
      });
    },

    setStep: (step) => {
      set((state) => {
        state.checkout.step = step;
      });
    },

    setSelectedPaymentMethod: (method) => {
      set((state) => {
        state.checkout.selectedPaymentMethod = method;
      });
    },

    setPaymentResult: (result) => {
      set((state) => {
        state.checkout.paymentResult = result;
      });
    },

    resetCheckout: () => {
      set((state) => {
        const currentData = state.checkout.formData;
        
        state.checkout = {
          ...initialCheckoutState,
          formData: {
            customFields: { ...currentData.customFields },
            quantity: currentData.quantity,
            donationAmount: currentData.donationAmount,
          }
        };
      });
    },

    clearSession: () => {
      set((state) => {
        state.checkout.isCreatingSession = false;
        state.checkout.session = undefined;
      });
    },

    isSessionValid: () => {
      const { session } = get().checkout;
      if (!session) return false;
      return new Date() < new Date(session.expiresAt);
    },

    createSession: async (amountUsdCents, chain, stablecoin, selectedOptions, cartItems, subtotalCents, taxCents, shippingCents, quantity) => {
      const { isCreatingSession } = get().checkout;

      if (isCreatingSession) {
        console.log('[CheckoutSlice] Session creation already in progress');
        return;
      }

      set((state) => {
        state.checkout.isCreatingSession = true;
      });

      const apiBaseUrl = get().config.apiBaseUrl;
      if (!apiBaseUrl) {
        throw new Error('API Base URL is not set');
      }

      const buttonConfig = get().config.buttonConfig;
      if (!buttonConfig) {
        throw new Error('Button Config is not set');
      }

      if (!buttonConfig.id) {
        throw new Error('Button ID is not set');
      }

      const { collectEmail, collectPhone, collectShipping } = buttonConfig;

      const { contact, shipping } = get().user;

      if (collectEmail && !contact?.email) {
        throw new Error('Email is required');
      }

      if (collectPhone && !contact?.phone) {
        throw new Error('Phone is required');
      }

      if (collectShipping && !shipping) {
        throw new Error('Shipping address is required');
      }

      try {
        const response = await createButtonSessionAPI(apiBaseUrl, buttonConfig.id, {
          amountUsdCents,
          chain,
          stablecoin,
          customerEmail: contact?.email,
          customerPhone: contact?.phone,
          selectedOptions,
          shippingAddress: shipping,
          cartItems,
          subtotalCents,
          taxCents,
          shippingCents,
          quantity,
        });

        set((state) => {
          state.checkout.session = {
            sessionToken: response.sessionToken,
            sessionId: response.sessionId,
            depositAddress: response.depositAddress,
            mneeDepositAddress: response.mneeDepositAddress,
            expiresAt: new Date(response.expiresAt),
            mneeAmount: response.mneeAmount,
          };
          if (state.checkout.errors.session) {
            delete state.checkout.errors.session;
          }
        });
      } catch (error: any) {
        set((state) => {
          state.checkout.errors = { 
            ...state.checkout.errors, 
            session: error.message 
          };
        });
        throw error;
      } finally {
        set((state) => {
          state.checkout.isCreatingSession = false;
        });
      }
    },
  },
});