import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { CheckoutState, CheckoutFormData, PaymentResult, WalletProvider, PaymentMethod } from '../types';
import { useWallet } from './WalletContext';
import { createButtonSession as createButtonSessionAPI, ChainName, ShippingAddress, CartItem } from '../lib/api';
import { DEFAULT_PAYMENT_METHOD } from '../constants/payment-methods';

interface CheckoutContextValue extends CheckoutState {
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  setErrors: (errors: Record<string, string>) => void;
  setStep: (step: CheckoutState['step']) => void;
  connectWallet: (address: string, provider: WalletProvider) => void;
  disconnectWallet: () => void;
  setPaymentResult: (result: PaymentResult) => void;
  resetCheckout: () => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;

  // Session management - creates session via MNEE Pay API
  createSession: (
    apiBaseUrl: string,
    buttonId: string,
    amountUsdCents: number,
    chain: ChainName,
    stablecoin: string,
    customerEmail?: string,
    selectedOptions?: Record<string, string>,
    customerPhone?: string,
    shippingAddress?: ShippingAddress,
    cartItems?: CartItem[],
    subtotalCents?: number,
    taxCents?: number,
    shippingCents?: number,
    quantity?: number
  ) => Promise<void>;

  clearSession: () => void;
  isSessionValid: () => boolean;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

const initialFormData: CheckoutFormData = {
  customFields: {},
};

const initialState: CheckoutState = {
  step: 'initial',
  formData: initialFormData,
  errors: {},
  selectedPaymentMethod: DEFAULT_PAYMENT_METHOD,
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);

  // Track if session creation is in progress to prevent duplicate requests
  const isCreatingSession = useRef(false);

  // Get wallet state from WalletContext
  const wallet = useWallet();

  // Sync wallet state from WalletContext to CheckoutContext
  useEffect(() => {
    if (wallet.isConnected && wallet.address && wallet.provider) {
      setState(prev => ({
        ...prev,
        walletAddress: wallet.address,
        walletProvider: wallet.provider,
      }));
    } else {
      setState(prev => ({
        ...prev,
        walletAddress: undefined,
        walletProvider: undefined,
      }));
    }
  }, [wallet.isConnected, wallet.address, wallet.provider]);

  const updateFormData = useCallback((data: Partial<CheckoutFormData>) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...data,
        customFields: {
          ...prev.formData.customFields,
          ...(data.customFields || {}),
        },
      },
    }));
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({ ...prev, errors }));
  }, []);

  const setStep = useCallback((step: CheckoutState['step']) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setSelectedPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({ ...prev, selectedPaymentMethod: method }));
  }, []);

  // Legacy method - now delegates to WalletContext
  const connectWallet = useCallback((address: string, provider: WalletProvider) => {
    // This is kept for backward compatibility
    // The actual connection is now handled by WalletContext
    setState(prev => ({
      ...prev,
      walletAddress: address,
      walletProvider: provider,
    }));
  }, []);

  // Legacy method - now delegates to WalletContext
  const disconnectWallet = useCallback(async () => {
    // This is kept for backward compatibility
    // The actual disconnection is now handled by WalletContext
    await wallet.disconnect();
  }, [wallet]);

  const setPaymentResult = useCallback((result: PaymentResult) => {
    setState(prev => ({
      ...prev,
      paymentResult: result,
      // Don't automatically set step to 'complete' - let caller control when to show success
      // This allows waiting for merchant's onSuccess callback to complete before showing success
    }));
  }, []);

  const resetCheckout = useCallback(() => {
    setState(prev => ({
      step: 'initial',
      errors: {},
      selectedPaymentMethod: DEFAULT_PAYMENT_METHOD,
      // Preserve all form data so user doesn't have to re-enter
      // This includes email, shipping, donationAmount, customFields, quantity, etc.
      formData: {
        email: prev.formData.email,
        customFields: { ...prev.formData.customFields },
        shipping: prev.formData.shipping ? { ...prev.formData.shipping } : undefined,
        contact: prev.formData.contact ? { ...prev.formData.contact } : undefined,
        quantity: prev.formData.quantity,
        donationAmount: prev.formData.donationAmount,
      },
      // Preserve wallet connection across checkouts
      walletAddress: prev.walletAddress,
      walletProvider: prev.walletProvider,
      // Clear session and payment result for new checkout
      session: undefined,
      paymentResult: undefined,
    }));
  }, []);

  const createSession = useCallback(async (
    apiBaseUrl: string,
    buttonId: string,
    amountUsdCents: number,
    chain: ChainName,
    stablecoin: string,
    customerEmail?: string,
    selectedOptions?: Record<string, string>,
    customerPhone?: string,
    shippingAddress?: ShippingAddress,
    cartItems?: CartItem[],
    subtotalCents?: number,
    taxCents?: number,
    shippingCents?: number,
    quantity?: number
  ) => {
    // Prevent duplicate session creation
    if (isCreatingSession.current) {
      console.log('[CheckoutContext] Session creation already in progress, skipping duplicate request');
      return;
    }

    isCreatingSession.current = true;

    try {
      const response = await createButtonSessionAPI(apiBaseUrl, buttonId, {
        amountUsdCents,
        chain,
        stablecoin,
        customerEmail,
        customerPhone,
        selectedOptions,
        shippingAddress,
        cartItems,
        subtotalCents,
        taxCents,
        shippingCents,
        quantity,
      });

      setState(prev => ({
        ...prev,
        session: {
          sessionToken: response.sessionToken,
          sessionId: response.sessionId,
          depositAddress: response.depositAddress,
          mneeDepositAddress: response.mneeDepositAddress,
          expiresAt: new Date(response.expiresAt),
          mneeAmount: response.mneeAmount,
        },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        errors: { session: error.message },
      }));
      throw error;
    } finally {
      isCreatingSession.current = false;
    }
  }, []);

  const clearSession = useCallback(() => {
    // Reset session creation flag when clearing session
    isCreatingSession.current = false;
    setState(prev => ({
      ...prev,
      session: undefined,
    }));
  }, []);

  const isSessionValid = useCallback(() => {
    if (!state.session) return false;
    return new Date() < state.session.expiresAt;
  }, [state.session]);

  const value: CheckoutContextValue = {
    ...state,
    updateFormData,
    setErrors,
    setStep,
    connectWallet,
    disconnectWallet,
    setPaymentResult,
    resetCheckout,
    setSelectedPaymentMethod,
    createSession,
    clearSession,
    isSessionValid,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}
