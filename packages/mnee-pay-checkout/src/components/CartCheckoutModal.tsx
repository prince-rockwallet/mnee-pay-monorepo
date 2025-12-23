import { useEffect, useMemo, useCallback, useRef } from 'react';
import { CheckoutProvider, useCheckout } from '../contexts/CheckoutContext';
import { useCart } from '../contexts/CartContext';
import { WalletConnection } from './WalletConnection';
import { PaymentConfirmation } from './PaymentConfirmation';
import { WalletStatusBadge } from './WalletStatusBadge';
import { CartView } from './CartView';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { CheckoutMetadata, PaymentResult } from '../types';
import { useWallet } from '../store';

interface CartCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: 'light' | 'dark';
  /** Display mode: 'modal' for centered dialog, 'drawer' for slide-in from right (default: 'drawer') */
  displayMode?: 'modal' | 'drawer';
  /** URL to merchant's calculate-totals endpoint. Merchant backend calculates final pricing (tax, shipping, totals) */
  calculateTotalsUrl: string;
  /** Merchant ID (UUID from backend registration) */
  merchantId: string;
  /** Backend API base URL */
  apiBaseUrl: string;
  collectEmail?: boolean;
  collectShipping?: boolean;
  /** Custom metadata for server validation (orderId, sessionId, etc.) */
  metadata?: CheckoutMetadata;
  onSuccess?: (result: any, checkoutData?: any) => void;
  onError?: (error: Error) => void;
}

function CartCheckoutContent({
  calculateTotalsUrl,
  merchantId,
  apiBaseUrl,
  collectEmail = false,
  collectShipping = false,
  metadata,
  onSuccess,
  onError,
  onClose,
  displayMode = 'drawer',
}: Omit<CartCheckoutModalProps, 'open' | 'onOpenChange' | 'theme'> & { onClose?: () => void }) {
  const { step, setStep, walletAddress, formData } = useCheckout();
  const { items } = useCart(); // clearCart is called by PaymentConfirmation after onSuccess

  // Memoize session metadata to prevent unnecessary re-renders
  // Use standardized items[] format (same as single product checkouts)
  const sessionMetadata = useMemo(() => ({
    ...metadata,
    items: items.map(item => ({
      externalId: item.productExternalId || item.id,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions,
    })),
  }), [metadata, items]);

  // Initialize step to 'cart' when component mounts (show cart view first)
  useEffect(() => {
    setStep('cart');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance to confirming step when wallet connects
  useEffect(() => {
    if (walletAddress && step === 'connecting') {
      // Move to confirming - PaymentConfirmation will handle session creation after token selection
      setStep('confirming');
    }
  }, [walletAddress, step, setStep]);

  const handleSuccess = (result: PaymentResult) => {
    // IMPORTANT: Return the Promise so PaymentConfirmation can await it
    // PaymentConfirmation will call clearCart() after this completes
    // Merchant retrieves session data (items, email, shipping) from MNEE API using sessionId
    return onSuccess?.(result);
  };

  // Handle proceeding to checkout - validation and totals calculation happens in PaymentConfirmation
  const handleProceedToCheckout = () => {
    // Session will be created by PaymentConfirmation after token selection
    // PaymentConfirmation will also call calculate-totals endpoint
    if (!walletAddress) {
      setStep('connecting');
    } else {
      // If wallet already connected, proceed to payment
      // PaymentConfirmation will handle token selection and session creation
      setStep('confirming');
    }
  };

  // Show cart view first (totals will be calculated and shown during payment confirmation)
  if (step === 'cart') {
    return (
      <CartView
        onContinueShopping={() => onClose?.()}
        onProceedToCheckout={handleProceedToCheckout}
        collectEmail={collectEmail}
        collectShipping={collectShipping}
      />
    );
  }

  if (step === 'confirming' || step === 'processing' || step === 'complete' || step === 'error') {
    // Calculate cart subtotal from items (tax, shipping, total will be calculated by PaymentConfirmation)
    const cartSubtotal = items.reduce((sum, item) =>
      sum + (item.baseAmount + item.optionsTotal) * item.quantity,
      0
    );

    return (
      <PaymentConfirmation
        apiBaseUrl={apiBaseUrl}
        merchantId={merchantId}
        amountUsdCents={Math.round(cartSubtotal * 100)} // Pass cart subtotal, PaymentConfirmation will call calculate-totals for final amount
        sessionMetadata={sessionMetadata}
        onSuccess={handleSuccess}
        onError={onError || (() => {})}
        showConfetti
        isCartCheckout={true}
        metadata={metadata}
        displayMode={displayMode}
        onComplete={() => {
          onClose?.();
        }}
        checkoutType="ecommerce"
        calculateTotalsUrl={calculateTotalsUrl}
        shippingAddress={formData.shipping}
        customerEmail={formData.email}
      />
    );
  }

  return (
    <WalletConnection
      onConnect={() => {
      }}
    />
  );
}

function CartCheckoutModalContent({
  open,
  onOpenChange,
  theme = 'light',
  displayMode = 'drawer',
  ...props
}: CartCheckoutModalProps) {
  const { step, setStep } = useCheckout();
  const wallet = useWallet();
  const isSwitchingWallet = useRef(false);

  const handleSwitchWallet = useCallback(async () => {
    // Set flag to prevent auto-transition during wallet switch
    isSwitchingWallet.current = true;
    setStep('connecting'); // Set step FIRST before disconnect to avoid race condition
    await wallet.disconnect();
  }, [wallet, setStep]);

  // Auto-reopen modal after wallet connection
  useEffect(() => {
    // Only auto-transition if BOTH wallet is connected AND has address
    // This prevents auto-transition during wallet switching (when one is true but not both)
    if (wallet.isConnected && wallet.address && step === 'connecting' && !isSwitchingWallet.current) {
      setStep('confirming');

      // Re-open modal if it was closed during wallet connection
      if (!open) {
        onOpenChange(true);
      }
    }

    // Reset the switching flag once wallet is fully disconnected
    if (!wallet.isConnected && !wallet.address && step === 'connecting' && isSwitchingWallet.current) {
      isSwitchingWallet.current = false;
    }
  }, [wallet.isConnected, wallet.address, step, setStep, open, onOpenChange]);

  const handleCloseModal = useCallback((isOpen: boolean) => {

    // If user is in the middle of connecting, allow the close
    // This removes the blocking overlay so RainbowKit modal is clickable
    if (step === 'connecting' && !isOpen) {
      onOpenChange(false);
      return;
    }

    // Otherwise allow normal close behavior
    onOpenChange(isOpen);
  }, [step, onOpenChange]);

  const contentJsx = (
    <>
      {step === 'cart' ? (
        <>
          {displayMode === 'modal' ? (
            <>
              <DialogTitle className="text-foreground">Your Cart</DialogTitle>
              <DialogDescription className="text-muted-foreground">Review your items and checkout details</DialogDescription>
            </>
          ) : (
            <>
              <SheetTitle className="text-foreground">Your Cart</SheetTitle>
              <SheetDescription className="text-muted-foreground">Review your items and checkout details</SheetDescription>
            </>
          )}
        </>
      ) : step !== 'complete' && (
        <>
          {displayMode === 'modal' ? (
            <>
              <DialogTitle className="text-foreground">Complete Your Purchase</DialogTitle>
              <DialogDescription className="text-muted-foreground mb-6">Connect your wallet to complete the checkout</DialogDescription>
            </>
          ) : (
            <>
              <SheetTitle className="text-foreground">Complete Your Purchase</SheetTitle>
              <SheetDescription className="text-muted-foreground mb-6">Connect your wallet to complete the checkout</SheetDescription>
            </>
          )}
        </>
      )}

      <CartCheckoutContent {...props} onClose={() => onOpenChange(false)} />

      {/* Wallet Status Badge - Show at bottom */}
      {wallet.isConnected && step !== 'connecting' && step !== 'complete' && (
        <div className="mt-6">
          <WalletStatusBadge
            onSwitchWallet={handleSwitchWallet}
            showSwitchButton={step !== 'processing'}
            styling={undefined}
          />
        </div>
      )}
    </>
  );

  if (displayMode === 'drawer') {
    return (
      <Sheet open={open} onOpenChange={handleCloseModal}>
        <SheetContent side="right" className={theme === 'dark' ? 'dark' : ''}>
          {contentJsx}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className={theme === 'dark' ? 'dark' : ''}>
        {contentJsx}
      </DialogContent>
    </Dialog>
  );
}

export function CartCheckoutModal(props: CartCheckoutModalProps) {
  return (
    <CheckoutProvider>
      <CartCheckoutModalContent {...props} />
    </CheckoutProvider>
  );
}
