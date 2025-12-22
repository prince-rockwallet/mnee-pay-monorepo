import { useState, useEffect, useMemo, useCallback } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { YoursProvider } from 'yours-wallet-provider';
import { CheckoutProvider, useCheckout } from '../contexts/CheckoutContext';
import { WalletProvider, useWallet } from '../contexts/WalletContext';
import { CartProvider, useCart } from '../contexts/CartContext';
import { wagmiConfig } from '../lib/wagmi';
import { CheckoutButton } from './CheckoutButton';
import { CheckoutModal } from './CheckoutModal';
import { PaymentConfirmation } from './PaymentConfirmation';
import { PaywallCheckout } from './checkout-types/PaywallCheckout';
import { DonationCheckout } from './checkout-types/DonationCheckout';
import { EcommerceCheckout } from './checkout-types/EcommerceCheckout';
import { FloatingCartButton } from './FloatingCartButton';
import { CartView } from './CartView';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { MneeCheckoutProps, CheckoutType, CustomField } from '../types';
import { fetchButtonConfig, ButtonConfig } from '../lib/api';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { toast, Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import '@rainbow-me/rainbowkit/styles.css';
import { WalletSelectionModal } from './WalletSelectionModel';
import { WalletStatusBadge } from './WalletStatusBadge';

// Create a singleton QueryClient instance
const queryClient = new QueryClient();

function CheckoutContent(props: MneeCheckoutProps) {
  const {
    buttonId,
    apiBaseUrl,
    config: configOverride,
    previewMode = false,
    theme = 'light',
    styling,
    triggerMode = 'button',
    open: controlledOpen,
    onOpenChange,
    enabledWallets,
    disabled,
    className,
    children,
    showConfetti,
    onSuccess,
    onCancel,
    onError,
    onWalletConnect,
    onWalletDisconnect,
  } = props;

  // Button config loaded from API
  const [buttonConfig, setButtonConfig] = useState<ButtonConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { step, setStep, walletAddress, formData } = useCheckout();
  const wallet = useWallet();
  const { items, getCartTotal, clearCart } = useCart();
  const resolvedTheme = useTheme(theme);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = useCallback((open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  }, [onOpenChange]);

  // Load button config on mount (or use configOverride for preview mode)
  useEffect(() => {
    // If configOverride is provided, use it directly (preview mode)
    if (configOverride) {
      setButtonConfig({
        id: 'preview',
        buttonType: configOverride.buttonType,
        name: configOverride.name,
        description: configOverride.description,
        priceUsdCents: configOverride.priceUsdCents,
        allowCustomAmount: configOverride.allowCustomAmount ?? false,
        suggestedAmounts: configOverride.suggestedAmounts ?? [],
        minAmountCents: configOverride.minAmountCents,
        maxAmountCents: configOverride.maxAmountCents,
        productName: configOverride.productName,
        productImage: configOverride.productImage,
        customFields: configOverride.customFields,
        // Cart settings
        enableCart: configOverride.enableCart,
        cartPosition: configOverride.cartPosition,
        cartDisplayMode: configOverride.cartDisplayMode,
        showQuantitySelector: configOverride.showQuantitySelector,
        // Customer info
        collectEmail: configOverride.collectEmail,
        collectPhone: configOverride.collectPhone,
        collectShipping: configOverride.collectShipping,
        // Tax and shipping
        taxRatePercent: configOverride.taxRatePercent,
        shippingCostCents: configOverride.shippingCostCents,
        freeShippingThreshold: configOverride.freeShippingThreshold,
        buttonText: configOverride.buttonText ?? 'Pay with MNEE',
        theme: 'light',
        primaryColor: configOverride.primaryColor,
      });
      setConfigLoading(false);
      return;
    }

    // Otherwise fetch from API (requires buttonId)
    if (!buttonId) {
      setConfigError('Button ID or config is required');
      setConfigLoading(false);
      return;
    }

    async function loadConfig() {
      try {
        setConfigLoading(true);
        setConfigError(null);
        const config = await fetchButtonConfig(apiBaseUrl, buttonId!);
        setButtonConfig(config);
      } catch (error: any) {
        console.error('[MneeCheckout] Failed to load button config:', error);
        setConfigError(error.message || 'Failed to load checkout configuration');
        onError?.(error);
      } finally {
        setConfigLoading(false);
      }
    }
    loadConfig();
  }, [apiBaseUrl, buttonId, configOverride, onError]);

  // Convert API button config to checkout type
  const checkoutType: CheckoutType = useMemo(() => {
    if (!buttonConfig) return 'paywall';
    switch (buttonConfig.buttonType) {
      case 'DONATION': return 'donation';
      case 'ECOMMERCE': return 'ecommerce';
      case 'PAYWALL':
      default: return 'paywall';
    }
  }, [buttonConfig]);

  // Convert API custom fields to our CustomField format
  const customFields: CustomField[] | undefined = useMemo(() => {
    if (!buttonConfig?.customFields) return undefined;
    return buttonConfig.customFields.map(field => ({
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
  }, [buttonConfig]);

  // Build product object from button config
  const product = useMemo(() => {
    if (!buttonConfig) return null;
    return {
      externalId: buttonConfig.id,
      name: buttonConfig.productName || buttonConfig.name,
      description: buttonConfig.description,
      priceUsdCents: buttonConfig.priceUsdCents || 0,
    };
  }, [buttonConfig]);

  // Build resolved styling - merge prop styling with API-fetched buttonConfig styling
  // API config takes precedence for hosted buttons, prop styling is for SDK/preview overrides
  const resolvedStyling = useMemo(() => {
    if (!buttonConfig) return styling;
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

  const handleOpenModal = async () => {
    if (disabled || !buttonConfig) return;
    setIsOpen(true);
    setStep('collecting');
  };

  const handleCloseModal = () => {
    if (walletModalOpen) {
      setWalletModalOpen(false);
      return;
    }
    setIsOpen(false);
    onCancel?.();
  };

  // Close modal without triggering onCancel (used for "Add to Cart" flow)
  const handleCloseModalSilent = () => {
    setIsOpen(false);
  };
  const handleSwitchWallet = useCallback(async () => {
    if (wallet.isConnected) {
      try {
        await wallet.disconnect();
      } catch (error) {
        console.error(error);
      }
    }
    setTimeout(() => {
      setWalletModalOpen(true);
    }, 100);
  }, [wallet.isConnected]);

  const handleProceedToPayment = async () => {
    // In preview mode, show a toast and don't actually proceed
    if (previewMode) {
      toast.info('Preview Mode - Payment processing is disabled');
      return;
    }

    if (!walletAddress && !wallet.isConnected) {
      setWalletModalOpen(true);
      return;
    }
    setStep('confirming');
  };

  const handleWalletConnectedFromModal = useCallback((address: string, provider: any) => {
    setWalletModalOpen(false);
    onWalletConnect?.(address, provider);
  }, [onWalletConnect]);

  const handlePaymentSuccess = useCallback((result: any) => {
    const completeFormData = { ...formData };
    return onSuccess?.(result, completeFormData);
  }, [formData, onSuccess]);

  const handlePaymentError = useCallback((error: Error) => {
    onError?.(error);
  }, [onError]);

  // Calculate subtotal, tax, shipping, and total for non-cart checkouts
  const checkoutTotals = useMemo(() => {
    if (!buttonConfig) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };

    let subtotal = 0;

    // For donations with custom amount
    if (checkoutType === 'donation' && formData.donationAmount) {
      subtotal = Math.round(formData.donationAmount * 100);
    } else {
      // Start with base price
      subtotal = buttonConfig.priceUsdCents || 0;

      // Add price modifiers from selected custom field options
      if (buttonConfig.customFields && formData.customFields) {
        buttonConfig.customFields.forEach(field => {
          const selectedValue = formData.customFields[field.id];
          if (selectedValue && field.options) {
            const option = field.options.find(o => o.value === selectedValue);
            if (option?.priceModifierCents) {
              subtotal += option.priceModifierCents;
            }
          }
        });
      }

      // Apply quantity for ecommerce
      const quantity = formData.quantity || 1;
      subtotal = subtotal * quantity;
    }

    // Calculate tax from button config
    let tax = 0;
    if (buttonConfig.taxRatePercent && buttonConfig.taxRatePercent > 0) {
      tax = Math.round(subtotal * (buttonConfig.taxRatePercent / 100));
    }

    // Calculate shipping from button config (only for e-commerce with collectShipping)
    let shipping = 0;
    if (buttonConfig.collectShipping && buttonConfig.shippingCostCents) {
      // Check free shipping threshold
      if (buttonConfig.freeShippingThreshold && subtotal >= buttonConfig.freeShippingThreshold) {
        shipping = 0;
      } else {
        shipping = buttonConfig.shippingCostCents;
      }
    }

    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  }, [buttonConfig, checkoutType, formData]);

  // amountUsdCents is the total including tax and shipping (for non-cart checkouts)
  const amountUsdCents = checkoutTotals.total;

  // Calculate cart session data (for multi-item cart checkout)
  // Uses per-item tax rates and shipping costs stored on each cart item
  const cartSessionData = useMemo(() => {
    if (!buttonConfig?.enableCart || items.length === 0) {
      return null;
    }

    // Get totals calculated per-item (each item has its own taxRate, shippingCost, freeShippingThreshold)
    const totals = getCartTotal();

    // Convert to cents for API
    const subtotalCents = Math.round(totals.subtotal * 100);
    const taxCents = Math.round(totals.tax * 100);
    const shippingCents = Math.round(totals.shipping * 100);

    // Convert cart items to API format with per-item tax and shipping
    const apiCartItems = items.map((item, index) => {
      const itemBreakdown = totals.itemBreakdown[index];
      return {
        buttonId: item.productExternalId || buttonConfig.id,
        productName: item.productName,
        quantity: item.quantity,
        baseAmountCents: Math.round(item.baseAmount * 100),
        selectedOptions: item.selectedOptions as Record<string, string>,
        optionsTotalCents: Math.round(item.optionsTotal * 100),
        // Per-item tax and shipping (in cents)
        taxCents: Math.round((itemBreakdown?.itemTax || 0) * 100),
        shippingCents: Math.round((itemBreakdown?.itemShipping || 0) * 100),
      };
    });

    return {
      cartItems: apiCartItems,
      subtotalCents,
      taxCents,
      shippingCents,
      totalCents: subtotalCents + taxCents + shippingCents,
    };
  }, [buttonConfig, items, getCartTotal]);

  // Render loading state
  if (configLoading) {
    return (
      <div className={cn(resolvedTheme, className)}>
        <button
          disabled
          className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-6 py-3 rounded-lg cursor-not-allowed"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </button>
      </div>
    );
  }

  // Render error state
  if (configError || !buttonConfig || !product) {
    return (
      <div className={cn(resolvedTheme, className)}>
        <button
          onClick={() => {
            if (typeof window === 'undefined') {
              return;
            }
            window.location.reload();
          }}
          className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg hover:bg-destructive/90"
        >
          {configError || 'Configuration error'} - Click to retry
        </button>
      </div>
    );
  }

  const renderCheckoutContent = () => {
    switch (step) {
      case 'confirming':
      case 'processing':
      case 'complete':
      case 'error':
        return (
          <PaymentConfirmation
            apiBaseUrl={apiBaseUrl}
            buttonId={buttonId || 'preview'}
            amountUsdCents={cartSessionData ? cartSessionData.totalCents : amountUsdCents}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            showConfetti={showConfetti}
            styling={resolvedStyling}
            checkoutType={checkoutType}
            customerEmail={formData.email}
            customerPhone={formData.phone}
            selectedOptions={formData.customFields}
            shippingAddress={formData.shipping}
            quantity={formData.quantity}
            cartItems={cartSessionData?.cartItems}
            subtotalCents={cartSessionData?.subtotalCents}
            taxCents={cartSessionData?.taxCents}
            shippingCents={cartSessionData?.shippingCents}
            onComplete={() => {
              // Clear cart on successful payment
              if (buttonConfig?.enableCart && items.length > 0) {
                clearCart();
              }
              setIsOpen(false);
            }}
          />
        );

      case 'collecting':
      default:
        if (checkoutType === 'paywall') {
          return (
            <PaywallCheckout
              config={{
                title: buttonConfig.name,
                description: buttonConfig.description,
              }}
              product={product}
              customFields={customFields}
              onProceedToPayment={handleProceedToPayment}
              collectEmail={buttonConfig.collectEmail}
              collectPhone={buttonConfig.collectPhone}
              taxRatePercent={buttonConfig.taxRatePercent}
              shippingCostCents={buttonConfig.shippingCostCents}
            />
          );
        } else if (checkoutType === 'donation') {
          return (
            <DonationCheckout
              config={{
                title: buttonConfig.name,
                description: buttonConfig.description,
                suggestedAmounts: buttonConfig.suggestedAmounts?.map(a => a / 100) || [5, 10, 25, 50],
                allowCustomAmount: buttonConfig.allowCustomAmount,
                minAmount: buttonConfig.minAmountCents ? buttonConfig.minAmountCents / 100 : undefined,
                maxAmount: buttonConfig.maxAmountCents ? buttonConfig.maxAmountCents / 100 : undefined,
                buttonText: buttonConfig.buttonText
              }}
              product={product}
              customFields={customFields}
              onProceedToPayment={handleProceedToPayment}
              collectEmail={buttonConfig.collectEmail}
              collectPhone={buttonConfig.collectPhone}
              taxRatePercent={buttonConfig.taxRatePercent}
            />
          );
        } else {
          // Ecommerce
          return (
            <EcommerceCheckout
              config={{
                productName: buttonConfig.productName || buttonConfig.name,
                productDescription: buttonConfig.description,
                productImage: buttonConfig.productImage,
                enableCart: buttonConfig.enableCart,
                showQuantitySelector: buttonConfig.showQuantitySelector,
              }}
              product={product}
              customFields={customFields}
              onProceedToPayment={handleProceedToPayment}
              onClose={handleCloseModalSilent}
              collectEmail={buttonConfig.collectEmail}
              collectPhone={buttonConfig.collectPhone}
              collectShipping={buttonConfig.collectShipping}
              taxRatePercent={buttonConfig.taxRatePercent}
              shippingCostCents={buttonConfig.shippingCostCents}
              freeShippingThreshold={buttonConfig.freeShippingThreshold}
            />
          );
        }
    }
  };

  return (
    <div
      className={cn(
        resolvedTheme,
        className,
        (resolvedStyling?.buttonColor || resolvedStyling?.buttonTextColor) && 'mnee-custom-button-styles'
      )}
      style={{
        ...(resolvedStyling?.primaryColor && { '--primary': resolvedStyling.primaryColor } as any),
        ...(resolvedStyling?.buttonColor && { '--button-bg': resolvedStyling.buttonColor } as any),
        ...(resolvedStyling?.buttonTextColor && { '--button-text': resolvedStyling.buttonTextColor } as any),
      }}
    >
      {triggerMode === 'button' && (
        <CheckoutButton
          onClick={handleOpenModal}
          config={{
            text: buttonConfig.buttonText || 'Pay with MNEE',
          }}
          styling={resolvedStyling}
          checkoutType={checkoutType}
        />
      )}
      {children}
      <CheckoutModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        checkoutType={checkoutType}
        styling={resolvedStyling}
        theme={resolvedTheme}
        preventReset={step === 'confirming' || step === 'processing' || walletModalOpen}
      >
        {renderCheckoutContent()}
        {wallet.isConnected && step !== 'complete' && step !== 'processing' && (
          <div className="mt-6">
            <WalletStatusBadge
              onSwitchWallet={handleSwitchWallet}
              showSwitchButton={true}
              styling={resolvedStyling}
            />
          </div>
        )}
      </CheckoutModal>

      <WalletSelectionModal 
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        enabledWallets={enabledWallets}
        onWalletConnect={handleWalletConnectedFromModal}
        theme={resolvedTheme}
        styling={resolvedStyling}
        onWalletDisconnect={onWalletDisconnect}
      />

      {/* Floating Cart Button - only when cart is enabled */}
      {buttonConfig?.enableCart && (
        <FloatingCartButton
          onClick={() => setCartModalOpen(true)}
          position={buttonConfig.cartPosition || 'top-right'}
          buttonColor={resolvedStyling?.buttonColor}
          buttonTextColor={resolvedStyling?.buttonTextColor}
        />
      )}

      {/* Cart Modal - respects cartDisplayMode setting */}
      {buttonConfig?.enableCart && (
        buttonConfig.cartDisplayMode === 'modal' ? (
          <Dialog open={cartModalOpen} onOpenChange={setCartModalOpen}>
            <DialogContent className={cn(resolvedTheme, 'sm:max-w-lg max-h-[90vh] overflow-y-auto')}>
              <DialogTitle className="text-foreground">Your Cart</DialogTitle>
              <DialogDescription className="text-muted-foreground mb-4">
                Review your items before checkout
              </DialogDescription>
              <CartView
                onContinueShopping={() => setCartModalOpen(false)}
                onProceedToCheckout={() => {
                  if (previewMode) {
                    toast.info('Preview Mode - Payment processing is disabled');
                    return;
                  }
                  setCartModalOpen(false);
                  setIsOpen(true);
                  if (!walletAddress && !wallet.isConnected) {
                    setWalletModalOpen(true);
                  } else {
                    setStep('confirming');
                  }
                }}
                collectEmail={buttonConfig.collectEmail}
                collectPhone={buttonConfig.collectPhone}
                collectShipping={buttonConfig.collectShipping}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Sheet open={cartModalOpen} onOpenChange={setCartModalOpen}>
            <SheetContent side="right" className={cn(resolvedTheme, 'w-full sm:max-w-lg')}>
              <SheetTitle className="text-foreground">Your Cart</SheetTitle>
              <SheetDescription className="text-muted-foreground mb-4">
                Review your items before checkout
              </SheetDescription>
              <CartView
                onContinueShopping={() => setCartModalOpen(false)}
                onProceedToCheckout={() => {
                  if (previewMode) {
                    toast.info('Preview Mode - Payment processing is disabled');
                    return;
                  }
                  setCartModalOpen(false);
                  setIsOpen(true);
                  if (!walletAddress && !wallet.isConnected) {
                    setWalletModalOpen(true);
                  } else {
                    setStep('confirming');
                  }
                }}
                collectEmail={buttonConfig.collectEmail}
                collectPhone={buttonConfig.collectPhone}
                collectShipping={buttonConfig.collectShipping}
              />
            </SheetContent>
          </Sheet>
        )
      )}
    </div>
  );
}

// Wrapper with CheckoutProvider only (use when already inside MneeSharedProviders)
export function MneeCheckoutWithoutProviders(props: MneeCheckoutProps) {
  return (
    <CheckoutProvider>
      <CheckoutContent {...props} />
    </CheckoutProvider>
  );
}

/**
 * Shared providers wrapper - use this once at the root when you have multiple MneeCheckout buttons
 * Then use MneeCheckoutWithoutProviders for each button inside this wrapper
 */
export function MneeSharedProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <YoursProvider>
            <WalletProvider>
              <CartProvider>
                  {children}
                  <Toaster position='top-center' richColors />
              </CartProvider>
            </WalletProvider>
          </YoursProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Main export with all required providers (standalone usage)
export function MneeCheckout(props: MneeCheckoutProps) {
  return (
    <MneeSharedProviders>
      <MneeCheckoutWithoutProviders {...props} />
    </MneeSharedProviders>
  );
}

// Alias for backwards compatibility
export const MneeCheckoutInternal = MneeCheckout;
