import { PropsWithChildren, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogTitle, DialogDescription, DialogOverlay, DialogPortal } from './ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { CheckoutType, StyleConfig } from '../types';
import { cn } from '../lib/utils';
import { useCheckout } from '../store';

interface CheckoutModalProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutType: CheckoutType;
  styling?: StyleConfig;
  theme: 'light' | 'dark';
  scopeId: string;
  preventReset?: boolean; // Don't reset checkout state when modal closes
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export function CheckoutModal({
  open,
  onOpenChange,
  styling,
  theme,
  children,
  scopeId,
  preventReset = false,
}: CheckoutModalProps) {
  const { resetCheckout } = useCheckout();

  useEffect(() => {
    if (!open) {

      // Don't reset if we're in the middle of wallet connection
      if (preventReset) {
        return;
      }

      const timer = setTimeout(() => {
        resetCheckout();
      }, 300);
      return () => clearTimeout(timer);
    } else {
    }
  }, [open, resetCheckout, preventReset]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Simplified border radius - 'square' = 0, 'rounded' (default) = 0.5rem
  const borderRadiusValue = styling?.borderRadius === 'square' ? '0' : '0.5rem';

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogPortal>
        <div id={scopeId} style={{ display: 'contents' }}>
        {/* Match RainbowKit's overlay styling (rgba(0,0,0,0.3) with no blur) throughout */}
        <DialogOverlay
          className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] overflow-y-auto",
            "h-[100dvh] w-[100vw] p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:p-0 gap-0",
            theme === 'dark' && 'dark'
          )}
          style={{
            borderRadius: borderRadiusValue,
            ...(styling?.fontFamily && { fontFamily: styling.fontFamily }),
            ...(styling?.primaryColor && { '--primary': styling.primaryColor } as any),
            ...(styling?.accentColor && { '--accent': styling.accentColor } as any),
            ...(styling?.buttonColor && { '--button-bg': styling.buttonColor } as any),
            ...(styling?.buttonTextColor && { '--button-text': styling.buttonTextColor } as any),
          }}
        >
          <DialogTitle className="sr-only">Checkout</DialogTitle>
          <DialogDescription className="sr-only">
            Complete your payment securely with stablecoin
          </DialogDescription>
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-foreground z-10">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <div
            className={cn(
              'bg-background text-foreground p-6',
              (styling?.buttonColor || styling?.buttonTextColor) && 'mnee-custom-button-styles'
            )}
            style={{
              borderRadius: borderRadiusValue,
            }}
          >
            <AnimatePresence mode="wait">
              {open && (
                <motion.div
                  key="checkout-modal"
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
