import { ReactNode, createContext, useContext } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { YoursProvider } from 'yours-wallet-provider';
import { WalletProvider } from '../contexts/WalletContext';
import { CartProvider } from '../contexts/CartContext';
import { MneeContextProvider } from '../contexts/MneeContext';
import { wagmiConfig } from '../lib/wagmi';
import { Theme, StyleConfig } from '../types';
import '@rainbow-me/rainbowkit/styles.css';

// Create a singleton QueryClient instance
const queryClient = new QueryClient();

// ============================================================================
// Configuration Context
// ============================================================================

export interface CheckoutConfig {
  /** Merchant ID (UUID from backend registration) */
  merchantId: string;

  /** Merchant server API base URL (e.g., 'https://merchant.com') - NOT the MNEE API URL */
  apiBaseUrl: string;

  /** Default theme for all checkouts */
  theme?: Theme;

  /** Default styling for all checkouts */
  styling?: StyleConfig;
}

const CheckoutConfigContext = createContext<CheckoutConfig | undefined>(undefined);

export function useCheckoutConfig() {
  const context = useContext(CheckoutConfigContext);
  if (!context) {
    throw new Error('useCheckoutConfig must be used within MneeProvider. Wrap your app with <MneeProvider>');
  }
  return context;
}

// ============================================================================
// Provider Props
// ============================================================================

interface MneeProviderProps extends CheckoutConfig {
  children: ReactNode;
}

/**
 * MneeProvider - Wraps your app with all necessary providers for MNEE Checkout
 *
 * Use this when you need:
 * - Shopping cart functionality across multiple pages
 * - Wallet context available throughout your app
 * - Advanced checkout flows
 *
 * @example
 * ```tsx
 * import { MneeProvider } from '@mnee/checkout';
 *
 * function App() {
 *   return (
 *     <MneeProvider
 *       merchantId={process.env.VITE_MERCHANT_ID!}
 *       apiBaseUrl={process.env.VITE_MERCHANT_API_URL!}
 *     >
 *       <YourApp />
 *     </MneeProvider>
 *   );
 * }
 * ```
 */
export function MneeProvider({
  merchantId,
  apiBaseUrl,
  theme = 'light',
  styling,
  children
}: MneeProviderProps) {
  const config: CheckoutConfig = {
    merchantId,
    apiBaseUrl,
    theme,
    styling,
  };

  return (
    <CheckoutConfigContext.Provider value={config}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <YoursProvider>
              <WalletProvider>
                <CartProvider>
                    <MneeContextProvider>
                      {children}
                    </MneeContextProvider>
                </CartProvider>
              </WalletProvider>
            </YoursProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </CheckoutConfigContext.Provider>
  );
}
