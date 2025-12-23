import { WalletProviderType } from "..";
import { ButtonConfig, CartItem as CartItemAPI, ChainName } from "../lib/api";
import { CartItem, CheckoutFormData, CheckoutState, ContactInfo, MneeCheckoutProps, PaymentMethod, PaymentResult, ShippingAddress, StyleConfig, Theme } from "../types";

export interface UserState {
  shipping?: ShippingAddress;
  contact: ContactInfo;
}

export interface UserActions {
  setEmail: (email?: string) => void;
  setPhone: (phone?: string) => void;
  setShipping: (shipping: ShippingAddress) => void;
  setContact: (contact: ContactInfo) => void;
  clearUserInfo: () => void;
}

export interface UserSlice {
  user: UserState;
  userActions: UserActions;
}

export interface ConfigState {
  buttonConfig: ButtonConfig | null;
  styling: StyleConfig | null;
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  apiBaseUrl: string;
}

export interface ConfigActions {
  setTheme: (theme: Theme) => void;
  updateResolvedTheme: () => void;
  initializeConfig: (props: MneeCheckoutProps) => Promise<void>;
  resetConfig: () => void;
}

export interface ConfigSlice {
  config: ConfigState;
  configActions: ConfigActions;
}

export interface WalletBalance {
  formatted: string;
  value: bigint | number;
  currency: string;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  address?: string;
  provider?: WalletProviderType;
  
  chainId?: number;

  yoursAddress?: {
    bsvAddress?: string;
    ordAddress?: string;
    identityAddress?: string;
  };

  yoursPubKeys?: {
    bsvPubKey?: string;
    ordPubKey?: string;
    identityPubKey?: string;
  };

  balance?: WalletBalance;
}

export interface WalletActions {
  connectYours: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchWallet: (provider: WalletProviderType) => Promise<void>;
  setModalOpen: (isOpen: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  syncWeb3State: (data: Partial<WalletState>) => void;
  syncYoursState: (data: Partial<WalletState>) => void;
  resetWallet: () => void;
  registerWagmiDisconnect: (fn: () => void) => void;
}

export interface WalletSlice {
  wallet: WalletState;
  walletActions: WalletActions;
}

export interface CheckoutSliceState {
  step: CheckoutState['step'];
  formData: CheckoutFormData;
  errors: Record<string, string>;
  selectedPaymentMethod: PaymentMethod;
  session?: CheckoutState['session'];
  paymentResult?: PaymentResult;
  isCreatingSession: boolean;
}

export interface CheckoutActions {
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  setErrors: (errors: Record<string, string>) => void;
  setStep: (step: CheckoutState['step']) => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  setPaymentResult: (result: PaymentResult) => void;
  
  // Logic
  resetCheckout: () => void;
  clearSession: () => void;
  isSessionValid: () => boolean;

  // Async
  createSession: (
    amountUsdCents: number,
    chain: ChainName,
    stablecoin: string,
    selectedOptions?: Record<string, string>,
    cartItems?: CartItemAPI[],
    subtotalCents?: number,
    taxCents?: number,
    shippingCents?: number,
    quantity?: number
  ) => Promise<void>;
}

export interface CheckoutSlice {
  checkout: CheckoutSliceState;
  checkoutActions: CheckoutActions;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemBreakdown: Array<{
    itemId: string;
    itemSubtotal: number;
    itemTax: number;
    itemShipping: number;
    itemTotal: number;
  }>;
}

export interface CartSliceState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface CartActions {
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => CartTotals;
  syncCartState: (state: CartSliceState) => void;
}

export interface CartSlice {
  cart: CartSliceState;
  cartActions: CartActions;
}

export type StoreState = UserSlice & ConfigSlice & WalletSlice & CheckoutSlice & CartSlice;